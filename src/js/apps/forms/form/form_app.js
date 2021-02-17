import Radio from 'backbone.radio';
import dayjs from 'dayjs';

import App from 'js/base/app';

import intl from 'js/i18n';

import PatientSidebarApp from 'js/apps/patients/patient/sidebar/sidebar_app';

import FormsService from 'js/services/forms';

import {
  ContextTrailView,
  LayoutView,
  IframeView,
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
  onBeforeStart() {
    this.getRegion().startPreloader();

    this.setState({
      isActionSidebar: true,
      isExpanded: false,
      shouldShowHistory: false,
    });
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

    this.listenTo(action, 'destroy', function() {
      Radio.request('alert', 'show:success', intl.forms.form.formApp.deleteSuccess);
      Radio.trigger('event-router', 'default');
    });

    this.startFormService();

    this.showView(new LayoutView());

    this.showContextTrail();
    this.showSidebar();

    this.setState({ responseId: !!this.responses.length && this.responses.first().id });
    this.showFormActions();
  },
  startFormService() {
    const formService = this.addChildApp('formsService', FormsService, {
      patient: this.patient,
      action: this.action,
      form: this.form,
      responses: this.responses,
    });

    this.listenTo(formService, 'success', response => {
      response.set({ _created_at: dayjs().format() });
      this.responses.unshift(response);
      this.setState({ responseId: response.id });
      this.showFormActions();
    });
  },
  stateEvents: {
    'change': 'onChangeState',
    'change:shouldShowHistory': 'showFormActions',
    'change:responseId': 'showForm',
  },
  onChangeState(state) {
    if (!state.hasChanged('isExpanded') && !state.hasChanged('isActionSidebar')) return;

    this.showSidebar();
  },
  showContextTrail() {
    const contextTrail = new ContextTrailView({
      model: this.getState(),
      patient: this.patient,
      action: this.action,
      responses: this.responses,
      form: this.form,
    });

    this.listenTo(contextTrail, {
      'click:sidebarButton': this.onClickSidebarButton,
      'click:expandButton': this.onClickExpandButton,
      'click:historyButton': this.onClickHistoryButton,
      'click:printButton': this.onClickPrintButton,
    });

    this.showChildView('contextTrail', contextTrail);
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
  showFormActions() {
    if (!this.getState('responseId')) {
      this.getRegion('formActions').empty();
      return;
    }

    if (this.getState('shouldShowHistory')) {
      this.showFormHistory();
      return;
    }

    this.showFormUpdate();
  },
  showFormUpdate() {
    const response = this.responses.get(this.getState('responseId'));

    const updateView = this.showChildView('formActions', new UpdateView({ model: response }));

    this.listenTo(updateView, 'click:update', () => {
      this.setState({ responseId: null });
    });
  },
  showFormHistory() {
    const selected = this.responses.get(this.getState('responseId'));

    const historyView = this.showChildView('formActions', new HistoryView({ selected, collection: this.responses }));

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
