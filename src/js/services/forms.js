import $ from 'jquery';
import { extend, pluck, get } from 'underscore';

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
  getPrefillIds() {
    return {
      patient_id: get(this.patient, 'id'),
      patient_action_id: get(this.action, 'id'),
      program_action_id: this.action && this.action.get('_program_action'),
    };
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
        const submission = { data: extend(this.getPrefillIds(), response.data, fields.data.attributes) };
        submission.data.patient.fields = extend({}, get(response.data, ['patient', 'fields']), fields.data.attributes.patient.fields);

        channel.request('send', 'fetch:form:prefill', { definition, submission });
      });
    }

    return $.when(
      Radio.request('entities', 'fetch:forms:definition', this.form.id),
      Radio.request('entities', 'fetch:forms:fields', this.patient.id, this.form.id),
    ).then(([definition], [fields]) => {
      const submission = { data: extend(this.getPrefillIds(), fields.data.attributes) };
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
