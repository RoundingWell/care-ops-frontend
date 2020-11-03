import Radio from 'backbone.radio';

import App from 'js/base/app';

import intl from 'js/i18n';

import PatientSidebarApp from 'js/apps/patients/patient/sidebar/sidebar_app';
import FormHistoryApp from 'js/apps/forms/form/form-history_app';
import FormUpdateApp from 'js/apps/forms/form/form-update_app';

import { LayoutView } from 'js/views/forms/form/form_views';

export default App.extend({
  childApps: {
    patient: PatientSidebarApp,
    history: FormHistoryApp,
    update: FormUpdateApp,
  },
  onBeforeStart() {
    this.getRegion().startPreloader();
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
  onStart(options, [action], [patient]) {
    this.patient = patient;
    this.action = action;
    this.formResponses = action.getFormResponses();
    this.form = this.action.getForm();

    this.listenTo(action, {
      'destroy'() {
        Radio.request('alert', 'show:success', intl.forms.form.formApp.deleteSuccess);
        Radio.trigger('event-router', 'default');
      },
      'change:_form_responses'() {
        this.formResponses = action.getFormResponses();
      },
    });

    this.showView(new LayoutView({
      model: this.getState(),
      action,
      patient,
      form: this.form,
    }));

    this.setState({
      sidebar: 'action',
      historyResponseId: null,
    });
  },
  stateEvents: {
    'change:sidebar': 'onChangeSidebar',
    'change:historyResponseId': 'onChangeHistoryResponseId',
  },
  viewEvents: {
    'click:sidebarButton': 'onClickSidebarButton',
    'click:expandButton': 'onClickExpandButton',
    'click:historyButton': 'onClickHistoryButton',
    'click:printButton': 'onClickPrintButton',
  },
  onClickSidebarButton() {
    const sidebar = this.getState('sidebar');

    if (sidebar === 'action') {
      this.setState('sidebar', 'patient');
      return;
    }

    this.setState('sidebar', 'action');
  },
  onClickExpandButton() {
    const sidebar = this.getState('sidebar');

    if (sidebar) {
      this.setState('sidebar', null);
      return;
    }

    this.setState('sidebar', this.getState().previous('sidebar'));
  },
  onClickHistoryButton() {
    if (this.getChildApp('history').isRunning()) {
      this.setState('historyResponseId', null);
      return;
    }

    this.setState('historyResponseId', this.formResponses.first().id);
  },
  onClickPrintButton() {
    Radio.request(`form${ this.form.id }`, 'print:form');
  },
  onChangeSidebar(state, sidebar) {
    this.stopChildApp('patient');
    Radio.request('sidebar', 'close');

    if (!sidebar) {
      this.getRegion('sidebar').empty();
      return;
    }

    this.startChildApp('patient', {
      region: this.getRegion('sidebar'),
      patient: this.patient,
    });

    if (sidebar === 'action') {
      this.showActionSidebar();
    }
  },
  onChangeHistoryResponseId() {
    const historyResponseId = this.getState('historyResponseId');

    if (!historyResponseId) {
      this.startUpdateApp();
      return;
    }

    this.startHistoryApp();
  },
  showActionSidebar() {
    const sidebarApp = Radio.request('sidebar', 'start', 'action', { action: this.action, isShowingForm: true });

    this.listenTo(sidebarApp, 'stop', () => {
      const sidebar = this.getState('sidebar');

      if (sidebar === 'action') {
        this.setState('sidebar', 'patient');
      }
    });
  },
  startUpdateApp() {
    this.stopChildApp('history');

    this.startChildApp('update', {
      region: this.getRegion('form'),
      form: this.action.getForm(),
      response: this.formResponses.first(),
      action: this.action,
      state: this.getState(),
    });
  },
  startHistoryApp() {
    this.stopChildApp('update');

    const historyApp = this.startChildApp('history', {
      region: this.getRegion('form'),
      action: this.action,
      form: this.form,
    });

    this.listenTo(historyApp, {
      stop() {
        this.setState('historyResponseId', null);
      },
    });
  },
});
