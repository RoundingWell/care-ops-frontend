import { defer } from 'underscore';

import Radio from 'backbone.radio';

import RouterApp from 'js/base/routerapp';

import FlowApp from 'js/apps/patients/patient/flow/flow_app';
import PatientApp from 'js/apps/patients/patient/patient_app';
import ReducedScheduleApp from 'js/apps/patients/schedule/reduced_schedule_app';

export default RouterApp.extend({
  routerAppName: 'PatientsApp',
  childApps() {
    return {
      flow: FlowApp,
      patient: PatientApp,
      schedule: ReducedScheduleApp,
    };
  },
  defaultRoute() {
    const defaultRoute = 'schedule';

    this.routeAction(defaultRoute, () => {
      defer(()=> {
        this.navigateRoute(defaultRoute);
        Radio.request('nav', 'select', this.routerAppName, defaultRoute);
        this.setLatestList(defaultRoute);
        this.showSchedule();
      });
    });
  },
  eventRoutes() {
    return {
      'default': {
        action: 'defaultRoute',
        route: '',
      },
      'schedule': {
        action: 'showSchedule',
        route: 'schedule',
        isList: true,
      },
      'patient:dashboard': {
        action: 'showPatient',
        route: 'patient/dashboard/:id',
      },
      'patient:archive': {
        action: 'showPatient',
        route: 'patient/archive/:id',
      },
      'patient:action': {
        action: 'showPatient',
        route: 'patient/:id/action/:id',
      },
      'patient:action:new': {
        action: 'showPatient',
        route: 'patient/:id/action',
      },
      'flow': {
        action: 'showFlow',
        route: 'flow/:id',
      },
      'flow:action': {
        action: 'showFlow',
        route: 'flow/:id/action/:id',
      },
    };
  },
  showPatient(patientId) {
    this.startRoute('patient', { patientId });
  },
  showFlow(flowId) {
    this.startRoute('flow', { flowId });
  },
  showSchedule() {
    this.startCurrent('schedule');
  },
});
