import $ from 'jquery';
import { pluck, get } from 'underscore';

import Radio from 'backbone.radio';

import App from 'js/base/app';

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
    'fetch:data': 'fetchData',
    'fetch:form': 'fetchForm',
    'fetch:form:prefill': 'fetchFormPrefill',
    'fetch:form:response': 'fetchFormResponse',
  },
  readyForm() {
    this.trigger('ready');
  },
  fetchData({ dataSetName, query }) {
    const channel = this.getChannel();

    return $.when(Radio.request('entities', 'fetch:dataSet', dataSetName, query))
      .then(data => {
        channel.request('send', 'fetch:data', data);
      });
  },
  fetchForm() {
    const channel = this.getChannel();

    return $.when(Radio.request('entities', 'fetch:forms:definition', this.form.id))
      .then(definition => {
        channel.request('send', 'fetch:form', { definition });
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
      channel.request('send', 'fetch:form:prefill', {
        definition,
        formData: fields.data.attributes,
        prefill: response.data,
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
      channel.request('send', 'fetch:form:response', { definition, submission: response });
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
