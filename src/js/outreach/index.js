import 'js/base/setup';
import $ from 'jquery';
import { get, map } from 'underscore';
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import { v4 as uuid } from 'uuid';
import 'js/base/fontawesome';

import 'js/entities-service/forms';

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
            case 401:
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
      Radio.request('entities', 'fetch:forms:byAction', actionId),
      Radio.request('entities', 'fetch:forms:definition:byAction', actionId),
      Radio.request('entities', 'fetch:forms:fields', actionId),
    ];
  },
  onFail() {
    const dialogView = new DialogView();
    dialogView.showChildView('content', new ErrorView());
    this.showView(dialogView);
  },
  onStart({ actionId }, [form], [definition], [fields]) {
    this.actionId = actionId;
    this.form = form;
    this.definition = definition;
    this.fields = fields;
    this.setView(new iFrameFormView({ model: this.form }));
    this.startService();
    this.showFormSaveDisabled();
    this.showView();
  },
  startService() {
    this.channel = Radio.channel(`form${ this.form.id }`);

    this.channel.reply({
      'ready:form': this.showFormSave,
      'submit:form': this.submitForm,
      'fetch:form:data': this.getFormPrefill,
    }, this);
  },
  getFormPrefill() {
    this.channel.request('send', 'fetch:form:data', {
      definition: this.definition,
      formData: get(this.fields, 'data.attributes'.split('.'), {}),
      formSubmission: {},
      ...this.form.getContext(),
    });
  },
  showFormSaveDisabled() {
    if (this.form.isReadOnly()) return;
    this.showChildView('formAction', new SaveView({ isDisabled: true }));
  },
  showFormSave() {
    if (this.form.isReadOnly()) return;
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
      .done(/* istanbul ignore next: Skipping flaky portion of Outreach > Form test */ () => {
        this.showView(new DialogView());
      })
      .fail(({ responseJSON }) => {
        this.showFormSave();
        /* istanbul ignore next: Don't handle non-API errors */
        if (!responseJSON) return;
        const errors = map(responseJSON.errors, 'detail');
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
  // Modify viewport for mobile devices at full width
  $('meta[name=viewport]').attr('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0');
  new OutreachApp({ region: { el: document.getElementById('root') } });
  Backbone.history.start({ pushState: true });
}

export {
  startOutreachApp,
};
