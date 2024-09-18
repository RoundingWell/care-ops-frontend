import 'js/base/setup';

import Backbone from 'backbone';
import Radio from 'backbone.radio';

import App from 'js/base/app';

import 'js/entities-service';

import { FORM_RESPONSE_STATUS } from 'js/static';

const ActionFormApp = App.extend({
  beforeStart({ actionId }) {
    return [
      Radio.request('entities', 'fetch:forms:byAction', actionId),
      Radio.request('entities', 'fetch:forms:definition:byAction', actionId),
      Radio.request('entities', 'fetch:forms:data', actionId),
      Radio.request('entities', 'fetch:actions:model', actionId),
    ];
  },
  onStart(opts, form, definition, data, action) {
    const filter = this._getPrefillFilters(form, action);

    return Promise.resolve(Radio.request('entities', 'fetch:formResponses:latest', filter))
      .then(response => {
        parent.postMessage({ message: 'form:pdf', args: {
          definition,
          formData: data.attributes,
          responseData: response.getFormData(),
          formSubmission: response.getResponse(),
          contextScripts: form.getContextScripts(),
          loaderReducers: form.getLoaderReducers(),
        } }, window.origin);
      });
  },
  _getPrefillFilters(form, action) {
    const opts = {
      status: FORM_RESPONSE_STATUS.SUBMITTED,
      flow: action.get('_flow'),
      patient: action.get('_patient'),
    };

    const isReport = form.isReport();

    if (isReport) opts.submitted = `<=${ action.get('created_at') }`;

    const prefillActionTag = form.getPrefillActionTag();

    if (prefillActionTag) {
      opts['action.tags'] = prefillActionTag;

      return opts;
    }

    opts.action = action.id;

    return opts;
  },
});

const FormApp = App.extend({
  beforeStart({ formId, patientId, responseId }) {
    return [
      Radio.request('entities', 'fetch:forms:model', formId),
      Radio.request('entities', 'fetch:forms:definition', formId),
      Radio.request('entities', 'fetch:forms:data', null, patientId, formId),
      Radio.request('entities', 'fetch:formResponses:model', responseId),
    ];
  },
  onStart(opts, form, definition, data, response) {
    parent.postMessage({ message: 'form:pdf', args: {
      definition,
      formData: data.attributes,
      responseData: response.getFormData(),
      formSubmission: response.getResponse(),
      contextScripts: form.getContextScripts(),
      loaderReducers: form.getLoaderReducers(),
    } }, window.origin);
  },
});

const Router = Backbone.Router.extend({
  routes: {
    'formservice/action/:actionId': 'startActionFormService',
    'formservice/:formId/:patientId(/:responseId)': 'startFormService',
  },
  startActionFormService(actionId) {
    const app = new ActionFormApp();

    app.start({ actionId });
  },
  startFormService(formId, patientId, responseId) {
    const app = new FormApp();

    app.start({ formId, patientId, responseId });
  },
});

function startFormServiceApp() {
  new Router();
  Backbone.history.start({ pushState: true });
}

export {
  startFormServiceApp,
};
