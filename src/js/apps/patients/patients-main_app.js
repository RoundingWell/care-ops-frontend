import _ from 'underscore';

import RouterApp from 'js/base/routerapp';

import PatientApp from 'js/apps/patients/patient/patient_app';
import PatientsAllApp from 'js/apps/patients/list/patients-all_app';
import ViewApp from 'js/apps/patients/view/view_app';

export default RouterApp.extend({
  routerAppName: 'PatientsApp',

  childApps: {
    patient: PatientApp,
    patientsAll: PatientsAllApp,
    ownedByMe: ViewApp,
    roleActions: ViewApp,
    newActions: ViewApp,
    pastThree: ViewApp,
    lastThirty: ViewApp,
  },

  initialize() {
    this.router.route('', 'default', _.bind(this.defaultRoute, this));
  },

  defaultRoute() {
    const defaultRoute = 'patients:all';

    this.routeAction(defaultRoute, () => {
      this.replaceRoute(defaultRoute);
      this.showPatientsAll();
    });
  },

  eventRoutes: {
    'patients:all': {
      action: 'showPatientsAll',
      route: 'patients/all',
      isList: true,
    },
    'view': {
      action: 'showPatientsView',
      route: 'view/:id',
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
      route: ['patient/:id/action/:id'],
    },
    'patient:action:new': {
      action: 'showPatient',
      route: ['patient/:id/action'],
    },
  },

  showPatient(patientId) {
    const currentApp = this.getCurrent();
    if (currentApp && _.propertyOf(currentApp.patient)('id') === patientId) {
      currentApp.startRoute(this.getCurrentRoute());
      return;
    }
    this.startCurrent('patient', { patientId });
  },

  showPatientsAll() {
    this.startCurrent('patientsAll');
  },

  showPatientsView(viewId) {
    const viewsById = {
      'owned-by-me': 'ownedByMe',
      'actions-for-my-role': 'roleActions',
      'new-actions': 'newActions',
      'updated-past-three-days': 'pastThree',
      'done-last-thirty-days': 'lastThirty',
    };

    this.startCurrent(viewsById[viewId], { viewId });
  },
});
