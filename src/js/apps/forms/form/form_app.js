import Radio from 'backbone.radio';

import App from 'js/base/app';

import intl from 'js/i18n';

import { LayoutView } from 'js/views/forms/form/form_views';
import { SidebarView } from 'js/views/patients/patient/sidebar/sidebar_views';

export default App.extend({
  onBeforeStart() {
    this.getRegion().startPreloader();
    this.setState({
      sidebarView: 'action',
      sidebarVisible: true,
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

    this.showActionSidebar();
  },
  stateEvents: {
    'change:sidebarView': 'setSidebarView',
    'change:sidebarVisible': 'onChangeSidebarVisible',
  },
  viewEvents: {
    'click:sidebarButton': 'onClickSidebarButton',
    'click:expandButton': 'onClickExpandButton',
  },
  onClickSidebarButton() {
    const sidebarView = this.getState('sidebarView');
    const isSidebarVisible = this.getState('sidebarVisible');

    if (!isSidebarVisible) {
      this.toggleState('sidebarVisible');
      return;
    }

    if (sidebarView === 'action') {
      this.setState('sidebarView', 'patient');
      return;
    }

    this.setState('sidebarView', 'action');
  },
  onClickExpandButton() {
    this.toggleState('sidebarVisible');
  },
  onChangeSidebarVisible() {
    const isSidebarVisible = this.getState('sidebarVisible');

    if (isSidebarVisible) {
      this.setSidebarView();
      return;
    }

    this.emptySidebar();
  },
  setSidebarView() {
    const sidebarView = this.getState('sidebarView');

    if (sidebarView === 'action') {
      this.showActionSidebar();
    }

    if (sidebarView === 'patient') {
      this.showPatientSidebar();
    }
  },
  emptySidebar() {
    const sidebarView = this.getState('sidebarView');

    if (sidebarView === 'action') {
      Radio.request('sidebar', 'close');
    }

    if (sidebarView === 'patient') {
      this.getRegion('sidebar').empty();
    }
  },
  showPatientSidebar() {
    Radio.request('sidebar', 'close');
    this.showChildView('sidebar', new SidebarView({ model: this.patient }));
  },
  showActionSidebar() {
    this.getRegion('sidebar').empty();

    const sidebar = Radio.request('sidebar', 'start', 'action', { action: this.action });

    this.listenTo(sidebar, 'stop', () => {
      const isSidebarVisible = this.getState('sidebarVisible');

      if (isSidebarVisible) {
        this.setState('sidebarView', 'patient');
      }
    });
  },
});
