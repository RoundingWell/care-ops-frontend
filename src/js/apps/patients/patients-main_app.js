import { defer } from 'underscore';

import Radio from 'backbone.radio';

import RouterApp from 'js/base/routerapp';

import FlowApp from 'js/apps/patients/patient/flow/flow_app';
import PatientApp from 'js/apps/patients/patient/patient_app';
import WorklistApp from 'js/apps/patients/worklist/worklist_app';
import ScheduleApp from 'js/apps/patients/schedule/schedule_app';

export default RouterApp.extend({
  routerAppName: 'PatientsApp',

  childApps() {
    const worklistApp = WorklistApp;

    return {
      flow: FlowApp,
      patient: PatientApp,
      ownedBy: worklistApp,
      forTeam: worklistApp,
      newPastDay: worklistApp,
      pastThree: worklistApp,
      lastThirty: worklistApp,
      schedule: ScheduleApp,
    };
  },

  defaultRoute() {
    const defaultRoute = 'worklist';
    const defaultWorklist = 'owned-by';

    this.routeAction(defaultRoute, () => {
      defer(()=> {
        this.navigateRoute(defaultRoute, defaultWorklist);
        Radio.request('nav', 'select', this.routerAppName, defaultRoute, [defaultWorklist]);
        this.setLatestList(defaultRoute, [defaultWorklist]);
        this.showPatientsWorklist(defaultWorklist);
      });
    });
  },

  eventRoutes() {
    return {
      'default': {
        action: 'defaultRoute',
        route: '',
      },
      'worklist': {
        action: 'showPatientsWorklist',
        route: 'worklist/:id',
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
      'schedule': {
        action: 'showSchedule',
        route: 'schedule',
        isList: true,
      },

    };
  },

  showPatient(patientId) {
    this.startRoute('patient', { patientId });
  },

  showPatientsWorklist(worklistId) {
    const worklistsById = {
      'owned-by': 'ownedBy',
      'shared-by': 'forTeam',
      'new-past-day': 'newPastDay',
      'updated-past-three-days': 'pastThree',
      'done-last-thirty-days': 'lastThirty',
    };

    if (!worklistsById[worklistId]) {
      Radio.trigger('event-router', 'notFound');
      return;
    }

    this.startCurrent(worklistsById[worklistId], { worklistId });
  },

  showFlow(flowId) {
    this.startRoute('flow', { flowId });
  },

  showSchedule() {
    this.startCurrent('schedule');
  },
});
