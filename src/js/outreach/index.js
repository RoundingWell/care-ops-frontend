import $ from 'jquery';
import { get, pluck, extend } from 'underscore';
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import { v4 as uuid } from 'uuid';
import 'js/base/fontawesome';

import RouterApp from 'js/base/routerapp';
import App from 'js/base/app';

import {
  DialogView,
  iFrameFormView,
  SaveView,
  LoginView,
  ResponseErrorView,
  NotAvailableView,
  ErrorView,
} from './outreach_views';

$.ajaxSetup({ contentType: 'application/vnd.api+json' });

function getRelationship(id, type) {
  return { data: { type, id } };
}

function getToken({ dob, actionId }) {
  const data = {
    type: 'patient-tokens',
    id: uuid(),
    attributes: {
      reason: 'outreach',
      birth_date: dob,
    },
    relationships: {
      action: getRelationship(actionId, 'patient-actions'),
    },
  };

  return $.ajax({
    url: '/api/patient-tokens',
    method: 'POST',
    data: JSON.stringify({ data }),
  })
    .done(({ data: { attributes } }) => {
      $.ajaxSetup({
        beforeSend(xhr) {
          xhr.setRequestHeader('Authorization', `Bearer ${ attributes.token }`);
        },
      });
    });
}

function postResponse({ formId, actionId, response }) {
  const data = {
    type: 'form-responses',
    id: uuid(),
    attributes: { response },
    relationships: {
      action: getRelationship(actionId, 'patient-actions'),
      form: getRelationship(formId, 'forms'),
    },
  };

  return $.ajax({
    url: `/api/actions/${ actionId }/relationships/form-responses`,
    method: 'POST',
    data: JSON.stringify({ data }),
  });
}

const LoginApp = App.extend({
  onStart({ actionId }) {
    const dialogView = new DialogView();

    this.showLogin(actionId, dialogView.getRegion('content'));

    this.showView(dialogView);
  },
  showLogin(actionId, region) {
    const loginView = new LoginView({ model: this.getState() });

    this.listenTo(loginView, 'click:submit', () => {
      getToken({ actionId, dob: this.getState('dob') })
        .done(() => {
          this.stop({ isAuthed: true });
        })
        .fail(({ status }) => {
          switch (status) {
            case 400:
              this.setState({ hasError: true });
              break;
            case 409:
              region.show(new ResponseErrorView());
              break;
            case 404:
            case 403:
              region.show(new NotAvailableView());
              break;
            default:
              region.show(new ErrorView());
              break;
          }
        });
    });

    region.show(loginView);
  },
});

const FormApp = App.extend({
  beforeStart({ actionId }) {
    return [
      $.ajax(`/api/actions/${ actionId }/form`),
      $.ajax(`/api/actions/${ actionId }/form/definition`),
      $.ajax(`/api/actions/${ actionId }/form/fields`),
    ];
  },
  onFail() {
    const dialogView = new DialogView();
    dialogView.showChildView('content', new ErrorView());
    this.showView(dialogView);
  },
  onStart({ actionId }, [form], [definition], [fields]) {
    this.actionId = actionId;
    this.form = form.data;
    this.reducers = get(this.form, ['attributes', 'options', 'reducers'], ['return formData;']);
    this.definition = definition;
    this.fields = fields;
    this.isReadOnly = get(this.form, ['attributes', 'options', 'read_only']);
    this.setView(new iFrameFormView({ model: new Backbone.Model(extend({ id: this.form.id }, this.form.attributes)) }));
    this.startService();
    this.showFormSaveDisabled();
    this.showView();
  },
  startService() {
    this.channel = Radio.channel(`form${ this.form.id }`);

    this.channel.reply({
      'ready:form': this.showFormSave,
      'submit:form': this.submitForm,
      'fetch:form:prefill': this.getFormPrefill,
    }, this);
  },
  getFormPrefill() {
    this.channel.request('send', 'fetch:form:prefill', { definition: this.definition, formData: this.fields.data.attributes, reducers: this.reducers });
  },
  showFormSaveDisabled() {
    if (this.isReadOnly) return;
    this.showChildView('formAction', new SaveView({ isDisabled: true }));
  },
  showFormSave() {
    if (this.isReadOnly) return;
    const saveView = this.showChildView('formAction', new SaveView());

    this.listenTo(saveView, 'click', () => {
      this.channel.request('send', 'form:submit');
    });
  },
  submitForm({ response }) {
    postResponse({
      formId: this.form.id,
      actionId: this.actionId,
      response,
    })
      .done(() => {
        this.showView(new DialogView());
      })
      .fail(({ responseJSON }) => {
        this.showFormSave();
        /* istanbul ignore next: Don't handle non-API errors */
        if (!responseJSON) return;
        const errors = pluck(responseJSON.errors, 'detail');
        this.channel.request('send', 'form:errors', errors);
      });
  },
});

const OutreachApp = RouterApp.extend({
  childApps: {
    login: LoginApp,
    form: FormApp,
  },
  routerAppName: 'PatientsApp',
  eventRoutes: {
    'outreach': {
      action: 'show',
      route: 'outreach/:id',
    },
  },
  show(actionId) {
    this.actionId = actionId;

    this.startLogin();
  },
  startLogin() {
    const loginApp = this.startCurrent('login', { actionId: this.actionId });

    this.listenTo(loginApp, 'stop', () => {
      // NOTE: Future non-authed stop if (!isAuthed) return;
      this.startForm();
    });
  },
  startForm() {
    this.startCurrent('form', { actionId: this.actionId });
  },
});

function startOutreachApp() {
  new OutreachApp({ region: { el: document.getElementById('root') } });
  Backbone.history.start({ pushState: true });
}

export {
  startOutreachApp,
};
