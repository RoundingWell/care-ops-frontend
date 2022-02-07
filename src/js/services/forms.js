import $ from 'jquery';
import { pluck, get } from 'underscore';

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
  },
  radioRequests: {
    'ready:form': 'readyForm',
    'submit:form': 'submitForm',
    'fetch:directory': 'fetchDirectory',
    'fetch:form': 'fetchForm',
    'fetch:form:data': 'fetchFormPrefill',
    'fetch:form:response': 'fetchFormResponse',
    'version': 'checkVersion',
  },
  readyForm() {
    this.trigger('ready');
  },
  checkVersion(feVersion) {
    /* istanbul ignore if: can't test reload */
    if (feVersion !== versions.frontend) window.location.reload();
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

    return $.when(Radio.request('entities', 'fetch:forms:definition', this.form.id))
      .then(definition => {
        channel.request('send', 'fetch:form', {
          definition,
          contextScripts: this.form.getContextScripts(),
        });
      });
  },
  fetchFormPrefill() {
    const channel = this.getChannel();
    const firstResponse = this.responses && this.responses.first();

    return $.when(
      Radio.request('entities', 'fetch:forms:definition', this.form.id),
      Radio.request('entities', 'fetch:forms:fields', get(this.action, 'id'), this.patient.id, this.form.id),
      Radio.request('entities', 'fetch:formResponses:submission', get(firstResponse, 'id')),
    ).then(([definition], [fields], [response]) => {
      channel.request('send', 'fetch:form:data', {
        definition,
        formData: fields.data.attributes,
        formSubmission: response.data,
        contextScripts: this.form.getContextScripts(),
        reducers: this.form.getReducers(),
      });
    });
  },
  fetchFormResponse({ responseId }) {
    const channel = this.getChannel();

    return $.when(
      Radio.request('entities', 'fetch:forms:definition', this.form.id),
      Radio.request('entities', 'fetch:formResponses:submission', responseId),
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
