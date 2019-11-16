import Radio from 'backbone.radio';

import App from 'js/base/app';

import intl from 'js/i18n';

import { LayoutView } from 'js/views/forms/form/form_views';
import { SidebarView } from 'js/views/patients/patient/sidebar/sidebar_views';

export default App.extend({
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
    const response = this.action.getFormReponse();

    this.showView(new LayoutView({
      model: form,
      patient,
      response,
      state: this.getState(),
    }));
    this.showActionSidebar();
  },
  viewEvents: {
    'click:sidebarButton': 'onClickSidebarButton',
  },
  onClickSidebarButton() {
    const actionSidebar = this.getState('actionSidebar');

    if (!actionSidebar) {
      this.showActionSidebar();
      return;
    }

    actionSidebar.stop();
  },
  showPatientSidebar() {
    this.setState('actionSidebar', false);
    this.showChildView('sidebar', new SidebarView({ model: this.patient }));
  },
  showActionSidebar() {
    this.getRegion('sidebar').empty();

    const sidebar = Radio.request('sidebar', 'start', 'action', { action: this.action });

    this.listenTo(sidebar, 'stop', this.showPatientSidebar);

    this.setState('actionSidebar', sidebar);
  },
});
