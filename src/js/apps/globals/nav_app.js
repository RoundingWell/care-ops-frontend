import { compact, isEqual } from 'underscore';
import Backbone from 'backbone';
import Radio from 'backbone.radio';

import App from 'js/base/app';

import SearchApp from './search_app';
import { AppNavView, AppNavCollectionView, MainNavDroplist, PatientsAppNav, AdminToolsDroplist, i18n } from 'js/views/globals/app-nav/app-nav_views';
import { getPatientModal, ErrorView } from 'js/views/globals/patient-modal/patient-modal_views';

const appNavMenu = new Backbone.Collection([
  {
    onSelect() {
      window.open('https://help.roundingwell.com/');
    },
    text: i18n.mainNav.help,
    icon: {
      type: 'far',
      icon: 'life-ring',
    },
  },
  {
    onSelect() {
      Radio.request('auth', 'logout');
    },
    text: i18n.mainNav.signOut,
    icon: {
      type: 'fas',
      icon: 'right-from-bracket',
    },
  },
]);

const adminNavMenu = new Backbone.Collection([
  {
    onSelect() {
      Radio.trigger('event-router', 'dashboards:all');
    },
    id: 'DashboardsApp',
    text: i18n.adminNav.dashboards,
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
    text: i18n.adminNav.programs,
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
    text: i18n.adminNav.clinicians,
    icon: {
      type: 'far',
      icon: 'users-gear',
    },
  },
]);

const patientsAppWorkflowsNav = new Backbone.Collection([
  {
    text: i18n.patientsAppNav.ownedBy,
    icons: [{
      type: 'fas',
      icon: 'list',
    }],
    event: 'worklist',
    eventArgs: ['owned-by'],
  },
  {
    text: i18n.patientsAppNav.schedule,
    icons: [{
      type: 'fas',
      icon: 'calendar-star',
    }],
    event: 'schedule',
    eventArgs: [],
  },
  {
    text: i18n.patientsAppNav.sharedBy,
    icons: [{
      type: 'fas',
      icon: 'arrow-right-arrow-left',
    }],
    event: 'worklist',
    eventArgs: ['shared-by'],
  },
  {
    text: i18n.patientsAppNav.newPastDay,
    icons: [
      {
        type: 'fas',
        icon: 'angle-left',
      },
      {
        type: 'fas',
        icon: '1',
      },
    ],
    event: 'worklist',
    eventArgs: ['new-past-day'],
  },
  {
    text: i18n.patientsAppNav.updatedPastThree,
    icons: [
      {
        type: 'fas',
        icon: 'angle-left',
      },
      {
        type: 'fas',
        icon: '3',
      },
    ],

    event: 'worklist',
    eventArgs: ['updated-past-three-days'],
  },
  {
    text: i18n.patientsAppNav.doneLastThirty,
    icons: [
      {
        type: 'fas',
        icon: '3',
      },
      {
        type: 'fas',
        icon: '0',
      },
    ],

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
    this.setSelectedAdminNavItem(appName);

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
      adminNavMenu.remove('DashboardsApp');
    }

    if (!currentUser.can('clinicians:manage')) {
      adminNavMenu.remove('CliniciansApp');
    }

    if (!currentUser.can('programs:manage')) {
      adminNavMenu.remove('ProgramsApp');
    }

    if (currentUser.can('app:schedule:reduced')) {
      patientsAppWorkflowsNav.reset(patientsAppWorkflowsNav.filter({ event: 'schedule' }));
    }

    this.setView(new AppNavView());

    this.mainNav = new MainNavDroplist({ collection: appNavMenu });
    this.showChildView('navMain', this.mainNav);

    if (adminNavMenu.length) {
      this.adminNavMenu = new AdminToolsDroplist({ collection: adminNavMenu });
      this.showChildView('adminTools', this.adminNavMenu);
    }

    this.showNav();

    this.showView();
  },
  setSelectedAdminNavItem(appName) {
    if (!adminNavMenu.length) return;

    const selectedApp = adminNavMenu.get(appName);

    if (!selectedApp) this.adminNavMenu.setState('selected', null);

    this.adminNavMenu.setState('selected', selectedApp);
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
          .catch(({ responseData }) => {
            // This assumes that only the similar patient error is handled on the server
            const error = responseData.errors[0].detail;

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
