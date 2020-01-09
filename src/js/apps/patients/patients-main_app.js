import _ from 'underscore';

import Radio from 'backbone.radio';

import RouterApp from 'js/base/routerapp';

import FlowApp from 'js/apps/patients/patient/flow/flow_app';
import PatientApp from 'js/apps/patients/patient/patient_app';
import PatientsAllApp from 'js/apps/patients/list/patients-all_app';
import WorklistApp from 'js/apps/patients/worklist/worklist_app';

export default RouterApp.extend({
  routerAppName: 'PatientsApp',

  childApps: {
    flow: FlowApp,
    patient: PatientApp,
    patientsAll: PatientsAllApp,
    ownedByMe: WorklistApp,
    roleActions: WorklistApp,
    newActions: WorklistApp,
    pastThree: WorklistApp,
    lastThirty: WorklistApp,
  },

  defaultRoute() {
    const defaultRoute = 'worklist';
    const defaultWorklist = 'owned-by-me';

    this.routeAction(defaultRoute, () => {
      _.defer(()=> {
        this.replaceRoute(defaultRoute, defaultWorklist);
        Radio.request('nav', 'select', this.routerAppName, defaultRoute, [defaultWorklist]);
        this.showPatientsWorklist(defaultWorklist);
      });
    });
  },

  eventRoutes: {
    'default': {
      action: 'defaultRoute',
      route: '',
    },
    'patients:all': {
      action: 'showPatientsAll',
      route: 'patients/all',
      isList: true,
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
    'patient:dataEvents': {
      action: 'showPatient',
      route: 'patient/data-events/:id',
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
  },

  showPatient(patientId) {
    this.startRoute('patient', { patientId });
  },

  showPatientsAll() {
    this.startCurrent('patientsAll');
  },

  showPatientsWorklist(worklistId) {
    const worklistsById = {
      'owned-by-me': 'ownedByMe',
      'actions-for-my-role': 'roleActions',
      'new-actions': 'newActions',
      'updated-past-three-days': 'pastThree',
      'done-last-thirty-days': 'lastThirty',
    };

    this.startCurrent(worklistsById[worklistId], { worklistId });
  },

  showFlow(flowId) {
    this.startRoute('flow', { flowId });
  },
});
