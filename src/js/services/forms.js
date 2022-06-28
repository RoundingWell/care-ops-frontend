import $ from 'jquery';
import { pluck, get } from 'underscore';
import dayjs from 'dayjs';
import store from 'store';

import Radio from 'backbone.radio';

import App from 'js/base/app';

import { versions } from 'js/config';

export default App.extend({
  startAfterInitialized: true,
  channelName() {
    return `form${ this.getOption('form').id }`;
  },
  initialize(options) {
    this.mergeOptions(options, ['action', 'form', 'patient', 'responses']);
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
    'version': 'checkVersion',
  },
  readyForm() {
    this.trigger('ready');
  },
  checkVersion(feVersion) {
    /* istanbul ignore if: can't test reload */
    if (feVersion !== versions.frontend) window.location.reload();
  },
  getStoreId() {
    const actionId = get(this.action, 'id');
    const ids = [this.currentUser.id, this.patient.id, this.form.id];
    if (actionId) ids.push(actionId);
    return `form-subm-${ ids.join('-') }`;
  },
  getStoredSubmission() {
    return store.get(this.getStoreId()) || {};
  },
  updateStoredSubmission(submission) {
    const updated = dayjs().format();
    store.set(this.getStoreId(), { submission, updated });
  },
  clearStoredSubmission() {
    store.remove(this.getStoreId());
  },
  fetchDirectory({ directoryName, query }) {
    const channel = this.getChannel();

    return $.when(Radio.request('entities', 'fetch:directory', directoryName, query))
      .then(({ data }) => {
        channel.request('send', 'fetch:directory', get(data, ['attributes', 'value']));
      });
  },
  fetchForm() {
    const channel = this.getChannel();

    return $.when(
      Radio.request('entities', 'fetch:forms:definition', this.form.id),
      this.form.fetch(),
    )
      .then(definition => {
        channel.request('send', 'fetch:form', {
          definition,
          contextScripts: this.form.getContextScripts(),
        });
      });
  },
  fetchFormStoreSubmission({ submission }) {
    const channel = this.getChannel();

    return $.when(
      Radio.request(
        'entities', 'fetch:forms:definition', this.form.id,
        this.form.fetch(),
      ),
    ).then(definition => {
      channel.request('send', 'fetch:form:data', {
        definition,
        storedSubmission: submission,
        contextScripts: this.form.getContextScripts(),
        changeReducers: this.form.getChangeReducers(),
        beforeSubmit: this.form.getBeforeSubmit(),
      });
    });
  },
  fetchLatestFormSubmission() {
    const channel = this.getChannel();

    const prefillFormId = this.form.getPrefillFormId();

    return $.when(
      Radio.request('entities', 'fetch:forms:definition', this.form.id),
      Radio.request('entities', 'fetch:forms:fields', get(this.action, 'id'), this.patient.id, this.form.id),
      Radio.request('entities', 'fetch:formResponses:latestSubmission', this.patient.id, prefillFormId),
      this.form.fetch(),
    ).then(([definition], [fields], [response]) => {
      channel.request('send', 'fetch:form:data', {
        definition,
        formData: fields.data.attributes || {},
        formSubmission: response && response.data.attributes.response.data || {},
        contextScripts: this.form.getContextScripts(),
        reducers: this.form.getReducers(),
        changeReducers: this.form.getChangeReducers(),
        beforeSubmit: this.form.getBeforeSubmit(),
      });
    });
  },
  fetchFormPrefill() {
    const storedSubmission = this.getStoredSubmission();

    if (storedSubmission.updated) {
      return this.fetchFormStoreSubmission(storedSubmission);
    }

    const channel = this.getChannel();
    const firstResponse = this.responses && this.responses.first();

    if (!firstResponse && this.action && this.action.hasTag('prefill-latest-response')) {
      return this.fetchLatestFormSubmission();
    }

    return $.when(
      Radio.request('entities', 'fetch:forms:definition', this.form.id),
      Radio.request('entities', 'fetch:forms:fields', get(this.action, 'id'), this.patient.id, this.form.id),
      Radio.request('entities', 'fetch:formResponses:submission', get(firstResponse, 'id')),
      this.form.fetch(),
    ).then(([definition], [fields], [response]) => {
      channel.request('send', 'fetch:form:data', {
        definition,
        formData: fields.data.attributes || {},
        formSubmission: response.data || {},
        contextScripts: this.form.getContextScripts(),
        reducers: this.form.getReducers(),
        changeReducers: this.form.getChangeReducers(),
        beforeSubmit: this.form.getBeforeSubmit(),
      });
    });
  },
  fetchFormResponse({ responseId }) {
    const channel = this.getChannel();

    return $.when(
      Radio.request('entities', 'fetch:forms:definition', this.form.id),
      Radio.request('entities', 'fetch:formResponses:submission', responseId),
      this.form.fetch(),
    ).then(([definition], [response]) => {
      channel.request('send', 'fetch:form:response', {
        definition,
        formSubmission: response.data,
        contextScripts: this.form.getContextScripts(),
      });
    });
  },
  submitForm({ response }) {
    const channel = this.getChannel();
    const formResponse = Radio.request('entities', 'formResponses:model', {
      response,
      _form: this.form,
      _patient: this.patient,
      _action: this.action,
    });

    formResponse.saveAll()
      .then(() => {
        this.clearStoredSubmission();
        this.trigger('success', formResponse);
      }).fail(({ responseJSON }) => {
        /* istanbul ignore next: Don't handle non-API errors */
        if (!responseJSON) return;
        const errors = pluck(responseJSON.errors, 'detail');
        this.trigger('error', errors);
        channel.request('send', 'form:errors', errors);
      });
  },
});
