import $ from 'jquery';
import { extend, pluck } from 'underscore';

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
    'fetch:form': 'fetchForm',
    'fetch:form:prefill': 'fetchFormPrefill',
    'fetch:form:response': 'fetchFormResponse',
  },
  readyForm() {
    this.trigger('ready');
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

    if (this.responses && this.responses.length) {
      const firstResponse = this.responses.first();
      return $.when(
        Radio.request('entities', 'fetch:forms:definition', this.form.id),
        Radio.request('entities', 'fetch:forms:fields', this.patient.id, this.form.id, firstResponse.id),
        Radio.request('entities', 'fetch:formResponses:submission', firstResponse.id),
      ).then(([definition], [fields], [response]) => {
        const submission = { data: extend({}, response.data, fields.data.attributes) };
        submission.data.patient.fields = extend({}, response.data.patient.fields, fields.data.attributes.patient.fields);

        channel.request('send', 'fetch:form:prefill', { definition, submission });
      });
    }

    return $.when(
      Radio.request('entities', 'fetch:forms:definition', this.form.id),
      Radio.request('entities', 'fetch:forms:fields', this.patient.id, this.form.id),
    ).then(([definition], [fields]) => {
      const submission = { data: fields.data.attributes };
      channel.request('send', 'fetch:form:prefill', { definition, submission });
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
