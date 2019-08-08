import _ from 'underscore';
import Radio from 'backbone.radio';

import SubRouterApp from 'js/base/subrouterapp';

import DashboardApp from 'js/apps/patients/patient/dashboard/dashboard_app';
import DataEventsApp from 'js/apps/patients/patient/data-events/data-events_app';

import { LayoutView } from 'js/views/patients/patient/patient_views';
import { SidebarView } from 'js/views/patients/patient/sidebar/sidebar_views';

export default SubRouterApp.extend({
  eventRoutes() {
    return {
      'patient:dashboard': _.partial(this.startCurrent, 'dashboard'),
      'patient:dataEvents': _.partial(this.startCurrent, 'dataEvents'),
      'patient:action': this.startPatientAction,
      'patient:action:new': this.startPatientAction,
    };
  },

  childApps: {
    dashboard: DashboardApp,
    dataEvents: DataEventsApp,
  },

  currentAppOptions() {
    return {
      region: this.getRegion('content'),
      patient: this.getOption('patient'),
    };
  },

  onBeforeStart() {
    this.getRegion().startPreloader();
  },

  beforeStart({ patientId }) {
    return Radio.request('entities', 'fetch:patients:model', patientId);
  },

  onStart({ currentRoute }, patient) {
    this.patient = patient;

    this.setView(new LayoutView({ model: patient }));

    this.showSidebar();

    // Show/Empty patient sidebar based on app sidebar
    this.listenTo(Radio.channel('sidebar'), {
      'show': this.emptySidebar,
      'close': this.showSidebar,
    });

    this.startRoute(currentRoute);

    this.showView();
  },

  _getAction(patientId, actionId) {
    if (actionId) {
      return Radio.request('entities', 'actions:model', actionId);
    }

    const currentUser = Radio.request('auth', 'currentUser');
    const currentOrg = Radio.request('auth', 'currentOrg');
    const states = currentOrg.getStates();

    return Radio.request('entities', 'actions:model', {
      _patient: patientId,
      _state: states.at(0).id,
      _clinician: currentUser.id,
      _role: null,
      duration: 0,
      due_date: null,
    });
  },

  startPatientAction(patientId, actionId) {
    const action = this._getAction(patientId, actionId);

    if (!this.getCurrent() && !action.isDone()) this.startCurrent('dashboard', patientId);

    if (!this.getCurrent() && action.isDone()) this.startCurrent('dataEvents', patientId);

    const currentApp = this.getCurrent();

    if (!currentApp.isRunning()) {
      this.listenToOnce(currentApp, 'start', _.partial(this.startPatientAction, patientId, actionId));
      return;
    }

    Radio.request('sidebar', 'start', 'action', { action });

    currentApp.triggerMethod('edit:action', action);
  },

  showSidebar() {
    this.showChildView('sidebar', new SidebarView({ model: this.patient }));
  },

  emptySidebar() {
    this.getRegion('sidebar').empty();
  },
});
