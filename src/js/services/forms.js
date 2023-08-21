import { map, get, debounce } from 'underscore';
import dayjs from 'dayjs';
import store from 'store';

import Radio from 'backbone.radio';

import App from 'js/base/app';

import { FORM_RESPONSE_STATUS } from 'js/static';

import { versions } from 'js/config';

export default App.extend({
  startAfterInitialized: true,
  channelName() {
    return `form${ this.getOption('form').id }`;
  },
  initialize(options) {
    this.updateDraft = debounce(this.updateDraft, 30000);
    this.mergeOptions(options, ['action', 'form', 'patient', 'responses', 'latestDraft']);
    this.currentUser = Radio.request('bootstrap', 'currentUser');
  },
  radioRequests: {
    'ready:form': 'readyForm',
    'submit:form': 'submitForm',
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
    return (this.action && this.action.isLocked()) || this.form.isReadOnly();
  },
  getStoreId() {
    const actionId = get(this.action, 'id');
    const ids = [this.currentUser.id, this.patient.id, this.form.id];
    if (actionId) ids.push(actionId);
    return `form-subm-${ ids.join('-') }`;
  },
  getLatestDraft() {
    return this.latestDraft && this.latestDraft.getDraft();
  },
  getStoredSubmission() {
    const draftSubmission = this.getLatestDraft() || {};
    const submission = store.get(this.getStoreId()) || {};

    if (draftSubmission.updated && (!submission.updated || dayjs(draftSubmission.updated).isAfter(submission.updated))) {
      this.trigger('update:submission', draftSubmission.updated);
      return draftSubmission;
    }

    this.trigger('update:submission', submission.updated);
    return submission;
  },
  updateStoredSubmission(submission) {
    /* istanbul ignore if: difficult to test read only submission change */
    if (this.isReadOnly()) return;

    const updated = dayjs().format();
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
    this.trigger('update:submission');
    store.remove(this.getStoreId());
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
        contextScripts: this.form.getContextScripts(),
        changeReducers: this.form.getChangeReducers(),
        beforeSubmit: this.form.getBeforeSubmit(),
      });
    });
  },
  _getPrefillFilters({ flowId, patientId }, form) {
    const prefillActionTag = form.getPrefillActionTag();

    if (prefillActionTag) {
      return {
        'action.tags': prefillActionTag,
        'flow': flowId,
        'patient': patientId,
      };
    }

    return {
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
      Radio.request('entities', 'fetch:forms:fields', actionId, patientId, this.form.id),
      Radio.request('entities', 'fetch:formResponses:latestSubmission', filter),
    ]).then(([definition, fields, response]) => {
      channel.request('send', 'fetch:form:data', {
        definition,
        isReadOnly,
        formData: fields.attributes,
        formSubmission: response.get('response'),
        ...this.form.getContext(),
      });
    });
  },
  fetchFormPrefill() {
    const storedSubmission = this.getStoredSubmission();
    const isReadOnly = this.isReadOnly();

    if (!isReadOnly && storedSubmission.updated) {
      return this.fetchFormStoreSubmission(storedSubmission);
    }

    const channel = this.getChannel();
    const firstResponse = this.responses && this.responses.getSubmission();

    if (!firstResponse && this.action) {
      if (this.action.hasTag('prefill-latest-response')) return this.fetchLatestFormSubmission();
      if (this.action.hasTag('prefill-flow-response')) return this.fetchLatestFormSubmission(this.action.get('_flow'));
    }

    return Promise.all([
      Radio.request('entities', 'fetch:forms:definition', this.form.id),
      Radio.request('entities', 'fetch:forms:fields', get(this.action, 'id'), this.patient.id, this.form.id),
      Radio.request('entities', 'fetch:formResponses:model', get(firstResponse, 'id')),
    ]).then(([definition, fields, response]) => {
      channel.request('send', 'fetch:form:data', {
        definition,
        isReadOnly,
        formData: fields.attributes,
        formSubmission: response.get('response'),
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
        formSubmission: response.get('response'),
        contextScripts: this.form.getContextScripts(),
      });
    });
  },
  updateDraft() {
    const { submission } = store.get(this.getStoreId()) || {};
    const formResponse = Radio.request('entities', 'formResponses:model', {
      response: submission,
      status: FORM_RESPONSE_STATUS.DRAFT,
      _form: this.form,
      _patient: this.patient,
      _action: this.action,
    });

    return formResponse.saveAll();
  },
  submitForm({ response }) {
    const channel = this.getChannel();
    const formResponse = Radio.request('entities', 'formResponses:model', {
      response,
      status: FORM_RESPONSE_STATUS.SUBMITTED,
      _form: this.form,
      _patient: this.patient,
      _action: this.action,
    });

    this.trigger('submit');

    formResponse.saveAll()
      .then(() => {
        this.clearStoredSubmission();
        this.trigger('success', formResponse);
      }).catch(({ responseData }) => {
        /* istanbul ignore next: Don't handle non-API errors */
        if (!responseData) return;
        const errors = map(responseData.errors, 'detail');
        this.trigger('error', errors);
        channel.request('send', 'form:errors', errors);
      });
  },
});
