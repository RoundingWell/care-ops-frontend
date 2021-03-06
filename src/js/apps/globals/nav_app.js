import { compact, isEqual } from 'underscore';
import Backbone from 'backbone';
import Radio from 'backbone.radio';

import App from 'js/base/app';

import intl from 'js/i18n';

import { AppNavView, AppNavCollectionView, MainNavDroplist, PatientsAppNav, AdminAppNav } from 'js/views/globals/app-nav/app-nav_views';
import { PatientSearchModal } from 'js/views/globals/search/patient-search_views';
import { getPatientModal, ErrorView } from 'js/views/globals/patient-modal/patient-modal_views';

const i18n = intl.globals.nav;

const appNavMenu = new Backbone.Collection([
  {
    onSelect() {
      Radio.trigger('event-router', 'default');
    },
    id: 'PatientsApp',
    iconType: 'far',
    icon: 'window',
    text: i18n.app.patients,
  },
  {
    onSelect() {
      Radio.trigger('event-router', 'programs:all');
    },
    id: 'AdminApp',
    iconType: 'fas',
    icon: 'tools',
    text: i18n.app.admin,
  },
  {
    onSelect() {
      window.open('https://help.roundingwell.com/');
    },
    iconType: 'fas',
    icon: 'life-ring',
    text: i18n.app.help,
    isExternalLink: true,
  },
  {
    onSelect() {
      Radio.request('auth', 'logout');
    },
    iconType: 'fas',
    icon: 'sign-out-alt',
    text: i18n.app.signOut,
  },
]);

const adminAppNav = new Backbone.Collection([
  {
    text: i18n.adminApp.programs,
    event: 'programs:all',
    eventArgs: [],
  },
  {
    text: i18n.adminApp.clinicians,
    event: 'clinicians:all',
    eventArgs: [],
  },
  {
    text: i18n.adminApp.dashboards,
    event: 'dashboards:all',
    eventArgs: [],
  },
]);

const patientsAppWorkflowsNav = new Backbone.Collection([
  {
    text: i18n.patientsApp.worklists.ownedBy,
    event: 'worklist',
    eventArgs: ['owned-by'],
  },
  {
    text: i18n.patientsApp.worklists.schedule,
    event: 'schedule',
    eventArgs: [],
    className: 'app-nav__spacer',
  },
  {
    text: i18n.patientsApp.worklists.sharedByRole,
    event: 'worklist',
    eventArgs: ['shared-by'],
    className: 'app-nav__spacer',
  },
  {
    text: i18n.patientsApp.worklists.newPastDay,
    event: 'worklist',
    eventArgs: ['new-past-day'],
  },
  {
    text: i18n.patientsApp.worklists.updatedPastThree,
    event: 'worklist',
    eventArgs: ['updated-past-three-days'],
  },
  {
    text: i18n.patientsApp.worklists.doneLastThirty,
    event: 'worklist',
    eventArgs: ['done-last-thirty-days'],
  },
]);

export default App.extend({
  startAfterInitialized: true,
  channelName: 'nav',
  radioRequests: {
    'search': 'showSearchModal',
    'patient': 'showPatientModal',
    'select': 'selectNav',
  },
  stateEvents: {
    'change:currentApp': 'onChangeCurrentApp',
  },
  viewEvents: {
    'click:addPatient': 'onClickAddPatient',
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

    this.showNav(appName);
  },
  getNavMatch(appName, event, eventArgs) {
    if (appName === 'PatientsApp') {
      return this._navMatch(patientsAppWorkflowsNav, event, eventArgs);
    }

    if (appName === 'AdminApp') {
      return this._navMatch(adminAppNav, event, eventArgs);
    }
  },
  _navMatch(navCollection, event, eventArgs) {
    return navCollection.find(model => {
      return model.get('event') === event && isEqual(model.get('eventArgs'), eventArgs);
    });
  },
  onStart() {
    const currentUser = Radio.request('bootstrap', 'currentUser');

    if (!currentUser.can('admin')) {
      appNavMenu.remove('AdminApp');
      appNavMenu.remove('PatientsApp');
    }

    this.showView(new AppNavView());

    this.mainNav = new MainNavDroplist({ collection: appNavMenu });

    this.showChildView('navMain', this.mainNav);
  },
  setMainNav(appName) {
    const selectedApp = appNavMenu.get(appName);

    if (!selectedApp) return;

    this.mainNav.setState('selected', selectedApp);
  },
  showNav(appName) {
    if (appName === 'PatientsApp') {
      this.showChildView('navContent', this.getPatientsAppNav());
      return;
    }

    if (appName === 'AdminApp') {
      this.showChildView('navContent', this.getAdminAppNav());
      return;
    }

    this.getRegion('navContent').empty();
  },
  getPatientsAppNav() {
    const navView = new PatientsAppNav();

    const workflowsCollectionView = new AppNavCollectionView({ collection: patientsAppWorkflowsNav });

    navView.showChildView('worklists', workflowsCollectionView);

    this.listenTo(navView, 'search', () => {
      this.showSearchModal();
    });

    const hotkeyCh = Radio.channel('hotkey');
    navView.listenTo(hotkeyCh, 'search', evt => {
      evt.preventDefault();
      this.showSearchModal();
    });

    return navView;
  },
  getAdminAppNav() {
    const navView = new AdminAppNav();

    const adminCollectionView = new AppNavCollectionView({ collection: adminAppNav });

    navView.showChildView('admin', adminCollectionView);

    return navView;
  },
  showSearchModal(prefillText) {
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
              this.showSearchModal(query);
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
