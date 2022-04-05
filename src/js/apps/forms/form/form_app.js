import { extend } from 'underscore';
import Radio from 'backbone.radio';
import dayjs from 'dayjs';
import store from 'store';

import App from 'js/base/app';

import intl from 'js/i18n';

import PatientSidebarApp from 'js/apps/patients/patient/sidebar/sidebar_app';

import FormsService from 'js/services/forms';

import {
  LayoutView,
  IframeView,
  FormActionsView,
  StatusView,
  ReadOnlyView,
  SaveView,
  UpdateView,
  HistoryView,
} from 'js/views/forms/form/form_views';

export default App.extend({
  childApps: {
    patient: {
      AppClass: PatientSidebarApp,
      regionName: 'sidebar',
      getOptions: ['patient'],
    },
  },
  initFormState() {
    const storedState = store.get(`form-state_${ this.currentUser.id }`);

    this.setState(extend({ isActionSidebar: true, isExpanded: true, shouldShowHistory: false }, storedState));
  },
  onBeforeStart() {
    this.getRegion().startPreloader();

    this.currentUser = Radio.request('bootstrap', 'currentUser');

    this.initFormState();
  },
  beforeStart({ patientActionId }) {
    return [
      Radio.request('entities', 'fetch:actions:model', patientActionId),
      Radio.request('entities', 'fetch:patients:model:byAction', patientActionId),
    ];
  },
  onFail() {
    Radio.request('alert', 'show:error', intl.forms.form.formApp.notFound);
    Radio.trigger('event-router', 'default');
  },
  onBeforeStop() {
    this.removeChildApp('formsService');
  },
  onStart(options, [action], [patient]) {
    this.patient = patient;
    this.action = action;
    this.responses = action.getFormResponses();
    this.form = this.action.getForm();
    this.isReadOnly = this.form.isReadOnly();

    const widgets = this.form.getWidgets();

    this.listenTo(action, 'destroy', function() {
      Radio.request('alert', 'show:success', intl.forms.form.formApp.deleteSuccess);
      Radio.trigger('event-router', 'default');
    });

    this.startFormService();

    this.setView(new LayoutView({ model: this.form, patient, action, widgets }));

    this.setState({ responseId: !!this.responses.length && this.responses.first().id });

    this.showFormStatus();
    this.showFormAction();
    this.showActions();

    this.showSidebar();

    this.showView();
  },
  startFormService() {
    const formService = this.addChildApp('formsService', FormsService, {
      patient: this.patient,
      action: this.action,
      form: this.form,
      responses: this.responses,
    });

    this.listenTo(formService, {
      'success'(response) {
        response.set({ _created_at: dayjs().format() });
        this.responses.unshift(response);
        this.setState({ responseId: response.id });

        this.showFormStatus();
        this.showFormUpdate();
      },
      'ready'() {
        this.showFormSave();
      },
      'error'() {
        this.showFormSave();
      },
    });
  },
  stateEvents: {
    'change': 'onChangeState',
    'change:shouldShowHistory': 'showFormAction',
    'change:responseId': 'onChangeResponseId',
  },
  onChangeState(state) {
    if (!state.hasChanged('isExpanded') && !state.hasChanged('isActionSidebar')) return;

    this.showSidebar();

    store.set(`form-state_${ this.currentUser.id }`, { isExpanded: this.getState('isExpanded') });
  },
  onChangeResponseId() {
    this.showForm();
    this.showFormStatus();
  },
  showFormStatus() {
    if (this.isReadOnly) return;
    this.showChildView('status', new StatusView({
      model: this.responses.first(),
      isEditing: !this.getState('responseId'),
    }));
  },
  showActions() {
    const formActions = new FormActionsView({
      model: this.getState(),
      action: this.action,
      responses: this.responses,
    });

    this.listenTo(formActions, {
      'click:sidebarButton': this.onClickSidebarButton,
      'click:expandButton': this.onClickExpandButton,
      'click:historyButton': this.onClickHistoryButton,
      'click:printButton': this.onClickPrintButton,
    });

    this.showChildView('actions', formActions);
  },
  onClickSidebarButton() {
    if (this.getState('isExpanded')) {
      this.setState({ isActionSidebar: true, isExpanded: false });
      return;
    }

    this.toggleState('isActionSidebar');
  },
  onClickExpandButton() {
    this.toggleState('isExpanded');
  },
  onClickHistoryButton() {
    this.setState({ responseId: this.responses.first().id, shouldShowHistory: !this.getState('shouldShowHistory') });
  },
  onClickPrintButton() {
    Radio.request(`form${ this.form.id }`, 'send', 'print:form');
  },
  showForm() {
    this.showChildView('form', new IframeView({
      model: this.form,
      responseId: this.getState('responseId'),
    }));
  },
  showSidebar() {
    const isActionSidebar = this.getState('isActionSidebar');
    const isExpanded = this.getState('isExpanded');

    if (!isActionSidebar || isExpanded) {
      Radio.request('sidebar', 'close');
    }

    if (isExpanded) {
      this.stopChildApp('patient');
      this.getRegion('sidebar').empty();
      return;
    }

    if (isActionSidebar) {
      this.showActionSidebar();
    }

    this.startChildApp('patient');
  },
  showActionSidebar() {
    const sidebarApp = Radio.request('sidebar', 'start', 'action', { action: this.action, isShowingForm: true });

    this.listenTo(sidebarApp, 'stop', () => {
      if (this.getState('isExpanded')) return;
      this.setState('isActionSidebar', false);
    });
  },
  showFormAction() {
    if (this.isReadOnly) {
      this.showReadOnly();
      return;
    }

    if (!this.getState('responseId')) {
      this.showFormSaveDisabled();
      return;
    }

    if (this.getState('shouldShowHistory')) {
      this.showFormHistory();
      return;
    }

    this.showFormUpdate();
  },
  showReadOnly() {
    this.showChildView('formAction', new ReadOnlyView());
  },
  showFormSaveDisabled() {
    this.showChildView('formAction', new SaveView({ isDisabled: true }));
  },
  showFormSave() {
    if (this.isReadOnly) return;
    const saveView = this.showChildView('formAction', new SaveView());

    this.listenTo(saveView, 'click', () => {
      Radio.request(`form${ this.form.id }`, 'send', 'form:submit');
    });
  },
  showFormUpdate() {
    const updateView = this.showChildView('formAction', new UpdateView());

    this.listenTo(updateView, 'click', () => {
      this.setState({ responseId: null });
    });
  },
  showFormHistory() {
    const selected = this.responses.get(this.getState('responseId'));

    const historyView = this.showChildView('formAction', new HistoryView({ selected, collection: this.responses }));

    this.listenTo(historyView, {
      'change:response'(response) {
        this.setState({ responseId: response.id });
      },
      'click:current'() {
        this.setState({ responseId: this.responses.first().id, shouldShowHistory: false });
      },
    });
  },
});
