import _ from 'underscore';
import Radio from 'backbone.radio';

import SubRouterApp from 'js/base/subrouterapp';

import DashboardApp from 'js/apps/patients/patient/dashboard/dashboard_app';
import DataEventsApp from 'js/apps/patients/patient/data-events/data-events_app';
import ActionApp from 'js/apps/patients/patient/action/action_app';

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
    action: ActionApp,
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
    return [
      Radio.request('entities', 'fetch:patients:model', patientId),
      Radio.request('entities', 'fetch:patientFields:collection', patientId),
    ];
  },

  onStart({ currentRoute }, [patient]) {
    this.patient = patient;

    this.setView(new LayoutView({ model: patient }));

    this.showSidebar();

    this.startRoute(currentRoute);

    this.showView();
  },

  startPatientAction(patientId, actionId) {
    const actionApp = this.getChildApp('action');

    this.listenToOnce(actionApp, {
      'start'(options, action) {
        this.editActionList(action);
      },
      'fail'() {
        this.startCurrent('dashboard');
      },
    });

    this.startChildApp('action', { actionId, patientId });
  },

  startActionList(action) {
    if (action.isDone()) return this.startCurrent('dataEvents');

    return this.startCurrent('dashboard');
  },

  // Triggers event on started action list for marking the edited action
  editActionList(action) {
    const currentActionList = this.getCurrent() || this.startActionList(action);

    if (!currentActionList.isRunning()) {
      this.listenToOnce(currentActionList, 'start', () => {
        currentActionList.triggerMethod('edit:action', action);
      });
      return;
    }

    currentActionList.triggerMethod('edit:action', action);
  },

  showSidebar() {
    this.showChildView('sidebar', new SidebarView({ model: this.patient }));
  },
});
