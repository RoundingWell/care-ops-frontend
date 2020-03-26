import _ from 'underscore';

import Radio from 'backbone.radio';

import RouterApp from 'js/base/routerapp';

import FlowApp from 'js/apps/patients/patient/flow/flow_app';
import PatientApp from 'js/apps/patients/patient/patient_app';
import WorklistApp from 'js/apps/patients/worklist/worklist_app';
import OwnedByWorklistApp from 'js/apps/patients/worklist/worklist-owned-by_app';

export default RouterApp.extend({
  routerAppName: 'PatientsApp',

  childApps: {
    flow: FlowApp,
    patient: PatientApp,
    ownedBy: OwnedByWorklistApp,
    forMyRole: WorklistApp,
    newPastDay: WorklistApp,
    pastThree: WorklistApp,
    lastThirty: WorklistApp,
  },

  defaultRoute() {
    const defaultRoute = 'worklist:flows';
    const defaultWorklist = 'owned-by';

    this.routeAction(defaultRoute, () => {
      _.defer(()=> {
        this.replaceRoute(defaultRoute, defaultWorklist);
        Radio.request('nav', 'select', this.routerAppName, defaultRoute, [defaultWorklist]);
        this.setLatestList(defaultRoute, [defaultWorklist]);
        this.showPatientsWorklist('flows', defaultWorklist);
      });
    });
  },

  eventRoutes() {
    return {
      'default': {
        action: 'defaultRoute',
        route: '',
      },
      'worklist:actions': {
        action: _.partial(this.showPatientsWorklist, 'actions'),
        route: 'worklist/:id/actions',
        isList: true,
      },
      'worklist:flows': {
        action: _.partial(this.showPatientsWorklist, 'flows'),
        route: 'worklist/:id/flows',
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
    };
  },

  showPatient(patientId) {
    this.startRoute('patient', { patientId });
  },

  showPatientsWorklist(worklistType, worklistId) {
    const worklistsById = {
      'owned-by': 'ownedBy',
      'for-my-role': 'forMyRole',
      'new-past-day': 'newPastDay',
      'updated-past-three-days': 'pastThree',
      'done-last-thirty-days': 'lastThirty',
    };

    if (!worklistsById[worklistId]) {
      Radio.trigger('event-router', 'notFound');
      return;
    }

    this.startCurrent(worklistsById[worklistId], { worklistId, worklistType });
  },

  showFlow(flowId) {
    this.startRoute('flow', { flowId });
  },
});
