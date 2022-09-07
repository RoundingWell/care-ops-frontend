import { compact, isEqual } from 'underscore';
import Backbone from 'backbone';
import Radio from 'backbone.radio';

import App from 'js/base/app';

import SearchApp from './search_app';
import { AppNavView, AppNavCollectionView, MainNavDroplist, PatientsAppNav, i18n } from 'js/views/globals/app-nav/app-nav_views';
import { PatientSearchModal } from 'js/views/globals/search/patient-search_views';
import { getPatientModal, ErrorView } from 'js/views/globals/patient-modal/patient-modal_views';

const appNavMenu = new Backbone.Collection([
  {
    onSelect() {
      Radio.trigger('event-router', 'default');
    },
    id: 'PatientsApp',
    icon: {
      type: 'far',
      icon: 'window',
    },
    text: i18n.mainNav.patients,
  },
  {
    onSelect() {
      Radio.trigger('event-router', 'dashboards:all');
    },
    id: 'DashboardsApp',
    text: i18n.mainNav.dashboards,
    icon: {
      type: 'far',
      icon: 'gauge',
    },
  },
  {
    onSelect() {
      Radio.trigger('event-router', 'programs:all');
    },
    id: 'ProgramsApp',
    text: i18n.mainNav.programs,
    icon: {
      type: 'far',
      icon: 'screwdriver-wrench',
    },
  },
  {
    onSelect() {
      Radio.trigger('event-router', 'clinicians:all');
    },
    id: 'CliniciansApp',
    text: i18n.mainNav.clinicians,
    icon: {
      type: 'far',
      icon: 'users-gear',
    },
  },
  {
    onSelect() {
      window.open('https://help.roundingwell.com/');
    },
    text: i18n.mainNav.help,
    isExternalLink: true,
    icon: {
      type: 'far',
      icon: 'life-ring',
    },
  },
  {
    onSelect() {
      Radio.request('auth', 'logout');
    },
    hasDivider: true,
    text: i18n.mainNav.signOut,
    icon: {
      type: 'fas',
      icon: 'right-from-bracket',
    },
  },
]);

const patientsAppWorkflowsNav = new Backbone.Collection([
  {
    text: i18n.patientsAppNav.ownedBy,
    event: 'worklist',
    eventArgs: ['owned-by'],
  },
  {
    text: i18n.patientsAppNav.schedule,
    event: 'schedule',
    eventArgs: [],
    className: 'app-nav__spacer',
  },
  {
    text: i18n.patientsAppNav.sharedBy,
    event: 'worklist',
    eventArgs: ['shared-by'],
    className: 'app-nav__spacer',
  },
  {
    text: i18n.patientsAppNav.newPastDay,
    event: 'worklist',
    eventArgs: ['new-past-day'],
  },
  {
    text: i18n.patientsAppNav.updatedPastThree,
    event: 'worklist',
    eventArgs: ['updated-past-three-days'],
  },
  {
    text: i18n.patientsAppNav.doneLastThirty,
    event: 'worklist',
    eventArgs: ['done-last-thirty-days'],
  },
]);

export default App.extend({
  startAfterInitialized: true,
  channelName: 'nav',
  radioRequests: {
    'search': 'showSearch',
    'patient': 'showPatientModal',
    'select': 'selectNav',
  },
  stateEvents: {
    'change:currentApp': 'onChangeCurrentApp',
  },
  viewEvents: {
    'click:addPatient': 'onClickAddPatient',
  },
  childApps: {
    search: SearchApp,
  },
  selectNav(appName, event, eventArgs) {
    this.setState('currentApp', appName);

    const navMatch = this.getNavMatch(appName, event, compact(eventArgs));

    if (navMatch) {
      this.getView().removeSelected();
      navMatch.trigger('selected');
    }
  },
  onChangeCurrentApp(state, appName) {
    this.setMainNav(appName);

    this.getView().removeSelected();
  },
  getNavMatch(appName, event, eventArgs) {
    return this._navMatch(patientsAppWorkflowsNav, event, eventArgs);
  },
  _navMatch(navCollection, event, eventArgs) {
    return navCollection.find(model => {
      return model.get('event') === event && isEqual(model.get('eventArgs'), eventArgs);
    });
  },
  onStart() {
    const currentUser = Radio.request('bootstrap', 'currentUser');

    if (!currentUser.can('dashboards:view')) {
      appNavMenu.remove('DashboardsApp');
    }

    if (!currentUser.can('clinicians:manage')) {
      appNavMenu.remove('CliniciansApp');
    }

    if (!currentUser.can('programs:manage')) {
      appNavMenu.remove('ProgramsApp');
    }

    // If only patient, help, and sign out are left, remove patient
    if (appNavMenu.length === 3) {
      appNavMenu.remove('PatientsApp');
    }

    if (currentUser.can('app:schedule:reduced')) {
      patientsAppWorkflowsNav.reset(patientsAppWorkflowsNav.filter({ event: 'schedule' }));
    }

    this.setView(new AppNavView());

    this.mainNav = new MainNavDroplist({ collection: appNavMenu });

    this.showChildView('navMain', this.mainNav);

    this.showNav();

    this.showView();
  },
  setMainNav(appName) {
    const selectedApp = appNavMenu.get(appName);

    if (!selectedApp) return;

    this.mainNav.setState('selected', selectedApp);
  },
  showNav() {
    const navView = new PatientsAppNav();

    const workflowsCollectionView = new AppNavCollectionView({ collection: patientsAppWorkflowsNav });

    navView.showChildView('worklists', workflowsCollectionView);

    this.listenTo(navView, 'search', () => {
      this.showSearch();
    });

    const hotkeyCh = Radio.channel('hotkey');
    navView.listenTo(hotkeyCh, 'search', evt => {
      evt.preventDefault();
      this.showSearch();
    });

    this.showChildView('navContent', navView);
  },
  showSearch(prefillText) {
    if (!Radio.request('bootstrap', 'currentOrg:setting', 'patient_search_settings')) {
      const navView = this.getChildView('navContent');

      const patientSearchModal = new PatientSearchModal({
        collection: Radio.request('entities', 'searchPatients:collection'),
        prefillText,
      });

      this.listenTo(patientSearchModal, {
        'item:select'({ model }) {
          Radio.trigger('event-router', 'patient:dashboard', model.get('_patient'));
          patientSearchModal.destroy();
        },
        'destroy'() {
          navView.triggerMethod('search:active', false);
        },
      });

      Radio.request('modal', 'show:custom', patientSearchModal);

      navView.triggerMethod('search:active', true);
      return;
    }

    const navView = this.getChildView('navContent');

    const searchApp = this.startChildApp('search', { prefillText });

    this.listenTo(searchApp, 'stop', () => {
      navView.triggerMethod('search:active', false);
    });

    navView.triggerMethod('search:active', true);
  },
  onClickAddPatient() {
    this.showPatientModal();
  },
  getNewPatient() {
    const currentClinician = Radio.request('bootstrap', 'currentUser');
    const groups = currentClinician.getGroups();

    if (groups.length === 1) {
      return Radio.request('entities', 'patients:model', {
        _groups: [{ id: groups.first().id }],
      });
    }

    return Radio.request('entities', 'patients:model');
  },
  showPatientModal(patient) {
    patient = patient || this.getNewPatient();
    const patientClone = patient.clone();
    const patientModal = Radio.request('modal', 'show', getPatientModal({
      patient: patientClone,
      onSubmit: () => {
        if (!patient.canEdit()) {
          patientModal.destroy();
          return;
        }

        patientModal.disableSubmit();
        patient.saveAll(patientClone.attributes)
          .then(({ data }) => {
            Radio.trigger('event-router', 'patient:dashboard', data.id);
            patientModal.destroy();
          })
          .fail(({ responseJSON }) => {
            // This assumes that only the similar patient error is handled on the server
            const error = responseJSON.errors[0].detail;

            patientModal.getChildView('body').setState({
              errors: {
                name: error,
              },
            });

            const errorView = new ErrorView({ hasSearch: true, error });

            patientModal.listenTo(errorView, 'click:search', () => {
              const query = `${ patientClone.get('first_name') } ${ patientClone.get('last_name') }`;
              this.showSearch(query);
            });

            patientModal.showChildView('info', errorView);
          });
      },
    }));

    patientModal.disableSubmit(patient.canEdit());
    patientModal.listenTo(patientClone, {
      'change'() {
        patientModal.getRegion('info').empty();
        patientModal.disableSubmit(!patientClone.isValid());
      },
      'invalid'(model, errors) {
        const errorCode = errors.birth_date;
        if (errorCode === 'invalidDate') {
          patientModal.showChildView('info', new ErrorView({ errorCode }));
        }
      },
    });
  },
});
