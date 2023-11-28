import { map, get, debounce, omit } from 'underscore';
import dayjs from 'dayjs';
import store from 'store';

import Radio from 'backbone.radio';

import App from 'js/base/app';

import { FORM_RESPONSE_STATUS } from 'js/static';

import { versions } from 'js/config';

function getClinicians(teamId) {
  if (teamId) {
    const team = Radio.request('entities', 'teams:model', teamId);
    return team.getAssignableClinicians();
  }

  const currentWorkspace = Radio.request('bootstrap', 'currentWorkspace');
  return currentWorkspace.getAssignableClinicians();
}

export default App.extend({
  startAfterInitialized: true,
  channelName() {
    return `form${ this.getOption('form').id }`;
  },
  initialize(options) {
    this.updateDraft = debounce(this.updateDraft, 15000);
    this.mergeOptions(options, ['action', 'form', 'patient', 'responses', 'latestResponse']);
    this.currentUser = Radio.request('bootstrap', 'currentUser');
  },
  radioRequests: {
    'ready:form': 'readyForm',
    'submit:form': 'submitForm',
    'fetch:clinicians': 'fetchClinicians',
    'fetch:directory': 'fetchDirectory',
    'fetch:form': 'fetchForm',
    'fetch:form:data': 'fetchFormPrefill',
    'fetch:form:response': 'fetchFormResponse',
    'update:storedSubmission': 'updateStoredSubmission',
    'get:storedSubmission': 'getStoredSubmission',
    'clear:storedSubmission': 'clearStoredSubmission',
    'fetch:field': 'fetchField',
    'update:field': 'updateField',
    'version': 'checkVersion',
  },
  readyForm() {
    this.trigger('ready');
  },
  checkVersion(feVersion) {
    /* istanbul ignore if: can't test reload */
    if (feVersion !== versions.frontend) window.location.reload();
  },
  isReadOnly() {
    const isLocked = this.action && this.action.isLocked();
    const isSubmitRestricted = this.action && !this.action.canSubmit();

    return this.form.isReadOnly() || isLocked || isSubmitRestricted;
  },
  getStoreId() {
    const actionId = get(this.action, 'id');
    const ids = [this.currentUser.id, this.patient.id, this.form.id];
    if (actionId) ids.push(actionId);
    return `form-subm-${ ids.join('-') }`;
  },
  getLatestDraft() {
    if (this.responses) {
      // NOTE: latestResponse is for the currentUser
      // If the first response is not the latestResponse, the draft is invalidated
      if (this.responses.first() !== this.latestResponse) return {};
    }

    return (this.latestResponse && this.latestResponse.getDraft()) || {};
  },
  getStoredSubmission() {
    const draft = this.getLatestDraft();
    const localDraft = store.get(this.getStoreId()) || {};

    if (draft.updated && (!localDraft.updated || dayjs(draft.updated).isAfter(localDraft.updated))) {
      this.trigger('update:submission', draft.updated);
      return draft;
    }

    if (localDraft.updated) this.trigger('update:submission', localDraft.updated);
    return localDraft;
  },
  updateStoredSubmission(submission) {
    /* istanbul ignore if: difficult to test read only submission change */
    if (this.isReadOnly()) return;

    const updated = dayjs().format();

    // Cache the draft for debounced updateDraft
    this._draft = submission;

    try {
      store.set(this.getStoreId(), { submission, updated });
      this.trigger('update:submission', updated);
    } catch (e) /* istanbul ignore next: Tested locally, test runner borks on CI */ {
      store.each((value, key) => {
        if (String(key).startsWith('form-subm-')) store.remove(key);
      });
      store.set(this.getStoreId(), { submission, updated });
    }

    this.updateDraft();
  },
  clearStoredSubmission() {
    this.latestResponse = null;
    store.remove(this.getStoreId());
    this.trigger('update:submission');
  },
  fetchField({ fieldName, requestId }) {
    const channel = this.getChannel();
    const field = Radio.request('entities', 'patientFields:model', {
      name: fieldName,
      _patient: this.patient.id,
    });

    return field.fetch()
      .then(() => {
        channel.request('send', 'fetch:field', { value: field.getValue(), requestId });
      })
      .catch(error => {
        channel.request('send', 'fetch:field', { error, requestId });
      });
  },
  updateField({ fieldName, value, requestId }) {
    const channel = this.getChannel();
    const field = Radio.request('entities', 'patientFields:model', {
      name: fieldName,
      value,
      _patient: this.patient.id,
    });

    return field.saveAll()
      .then(() => {
        channel.request('send', 'update:field', { value: field.getValue(), requestId });
      })
      .catch(error => {
        channel.request('send', 'update:field', { error, requestId });
      });
  },
  fetchClinicians({ teamId, requestId }) {
    const channel = this.getChannel();

    const clinicians = getClinicians(teamId);

    channel.request('send', 'fetch:directory', { value: clinicians.toJSON(), requestId });
  },
  fetchDirectory({ directoryName, query, requestId }) {
    const channel = this.getChannel();

    return Promise.resolve(Radio.request('entities', 'fetch:directories:model', directoryName, query))
      .then(directory => {
        channel.request('send', 'fetch:directory', { value: directory.get('value'), requestId });
      })
      .catch(error => {
        channel.request('send', 'fetch:directory', { error, requestId });
      });
  },
  fetchForm() {
    const channel = this.getChannel();

    return Promise.resolve(Radio.request('entities', 'fetch:forms:definition', this.form.id))
      .then(definition => {
        channel.request('send', 'fetch:form', {
          definition,
          contextScripts: this.form.getContextScripts(),
        });
      });
  },
  fetchFormStoreSubmission({ submission }) {
    const channel = this.getChannel();

    return Promise.all([
      Radio.request('entities', 'fetch:forms:definition', this.form.id),
    ]).then(([definition]) => {
      channel.request('send', 'fetch:form:data', {
        definition,
        storedSubmission: submission,
        ...omit(this.form.getContext(), 'loaderReducers'),
      });
    });
  },
  _getPrefillFilters({ flowId, patientId }, form) {
    const prefillActionTag = form.getPrefillActionTag();

    if (prefillActionTag) {
      return {
        'status': FORM_RESPONSE_STATUS.SUBMITTED,
        'action.tags': prefillActionTag,
        'flow': flowId,
        'patient': patientId,
      };
    }

    return {
      status: FORM_RESPONSE_STATUS.SUBMITTED,
      form: form.getPrefillFormId(),
      flow: flowId,
      patient: patientId,
    };
  },
  fetchLatestFormSubmission(flowId) {
    const channel = this.getChannel();
    const isReadOnly = this.isReadOnly();
    const actionId = get(this.action, 'id');
    const patientId = this.patient.id;

    const filter = this._getPrefillFilters({ flowId, patientId }, this.form);

    return Promise.all([
      Radio.request('entities', 'fetch:forms:definition', this.form.id),
      Radio.request('entities', 'fetch:forms:data', actionId, patientId, this.form.id),
      Radio.request('entities', 'fetch:formResponses:latest', filter),
    ]).then(([definition, data, response]) => {
      channel.request('send', 'fetch:form:data', {
        definition,
        isReadOnly,
        formData: data.attributes,
        formSubmission: response.getResponse(),
        ...this.form.getContext(),
      });
    });
  },
  fetchFormPrefill() {
    const channel = this.getChannel();
    const storedSubmission = this.getStoredSubmission();
    const isReadOnly = this.isReadOnly();

    if (!isReadOnly && storedSubmission.updated) {
      return this.fetchFormStoreSubmission(storedSubmission);
    }

    const firstResponse = this.responses && this.responses.getFirstSubmission();

    if (!firstResponse && this.action) {
      if (this.action.hasTag('prefill-latest-response')) return this.fetchLatestFormSubmission();
      if (this.action.hasTag('prefill-flow-response')) return this.fetchLatestFormSubmission(this.action.get('_flow'));
    }

    return Promise.all([
      Radio.request('entities', 'fetch:forms:definition', this.form.id),
      Radio.request('entities', 'fetch:forms:data', get(this.action, 'id'), this.patient.id, this.form.id),
      Radio.request('entities', 'fetch:formResponses:model', get(firstResponse, 'id')),
    ]).then(([definition, data, response]) => {
      channel.request('send', 'fetch:form:data', {
        definition,
        isReadOnly,
        formData: data.attributes,
        formSubmission: response.getResponse(),
        ...this.form.getContext(),
      });
    });
  },
  fetchFormResponse({ responseId }) {
    const channel = this.getChannel();

    return Promise.all([
      Radio.request('entities', 'fetch:forms:definition', this.form.id),
      Radio.request('entities', 'fetch:formResponses:model', responseId),
    ]).then(([definition, response]) => {
      channel.request('send', 'fetch:form:response', {
        definition,
        formSubmission: response.getResponse(),
        contextScripts: this.form.getContextScripts(),
      });
    });
  },
  useLatestDraft(responseData) {
    if (!this.latestResponse || this.latestResponse.get('status') !== FORM_RESPONSE_STATUS.DRAFT) return responseData;

    return {
      ...responseData,
      id: this.latestResponse.id,
    };
  },
  updateDraft() {
    const data = this.useLatestDraft({
      response: { data: this._draft },
      status: FORM_RESPONSE_STATUS.DRAFT,
      _form: this.form,
      _patient: this.patient,
      _action: this.action,
    });

    const formResponse = Radio.request('entities', 'formResponses:model', data);

    this.latestResponse = formResponse;

    return formResponse.saveAll()
      .catch(({ responseData }) => {
        /* istanbul ignore next: Don't handle non-API errors */
        if (!responseData) return;

        this.trigger('error', responseData.errors);
      });
  },
  submitForm({ response }) {
    // Cancel any pending draft updates
    this.updateDraft.cancel();

    const data = this.useLatestDraft({
      response,
      status: FORM_RESPONSE_STATUS.SUBMITTED,
      _form: this.form,
      _patient: this.patient,
      _action: this.action,
    });

    const channel = this.getChannel();
    const formResponse = Radio.request('entities', 'formResponses:model', data);

    this.trigger('submit');

    return formResponse.saveAll()
      .then(() => {
        // Cancel any draft updates that may have been queued while the form was submitting
        this.updateDraft.cancel();
        this.clearStoredSubmission();
        this.trigger('success', formResponse);
      }).catch(({ responseData }) => {
        /* istanbul ignore next: Don't handle non-API errors */
        if (!responseData) return;

        this.trigger('error', responseData.errors);

        const errors = map(responseData.errors, 'detail');
        channel.request('send', 'form:errors', errors);
      });
  },
});
