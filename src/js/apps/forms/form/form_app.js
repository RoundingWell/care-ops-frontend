import Radio from 'backbone.radio';

import App from 'js/base/app';

import intl from 'js/i18n';

import PatientSidebarApp from 'js/apps/patients/patient/sidebar/sidebar_app';

import { LayoutView } from 'js/views/forms/form/form_views';

export default App.extend({
  childApps: {
    patient: PatientSidebarApp,
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

    this.listenTo(action, 'destroy', () => {
      Radio.request('alert', 'show:success', intl.forms.form.formApp.deleteSuccess);
      Radio.trigger('event-router', 'default');
    });

    const form = this.action.getForm();

    this.showView(new LayoutView({
      model: form,
      action,
      patient,
      state: this.getState(),
    }));

    this.setState('sidebar', 'action');
  },
  stateEvents: {
    'change:sidebar': 'onChangeSidebar',
  },
  viewEvents: {
    'click:sidebarButton': 'onClickSidebarButton',
    'click:expandButton': 'onClickExpandButton',
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
  showActionSidebar() {
    const sidebarApp = Radio.request('sidebar', 'start', 'action', { action: this.action, isShowingForm: true });

    this.listenTo(sidebarApp, 'stop', () => {
      const sidebar = this.getState('sidebar');

      if (sidebar === 'action') {
        this.setState('sidebar', 'patient');
      }
    });
  },
});
