import _ from 'underscore';
import Backbone from 'backbone';
import Radio from 'backbone.radio';

import App from 'js/base/app';

import intl from 'js/i18n';

import { AppNavView, AppNavCollectionView, MainNavDroplist, PatientsAppNav, AdminAppNav } from 'js/views/globals/app-nav/app-nav_views';

const i18n = intl.globals.nav;

const appNavMenu = new Backbone.Collection([
  {
    onSelect() {
      Radio.trigger('event-router', 'default');
    },
    id: 'PatientsApp',
    isFas: false,
    icon: 'window',
    text: i18n.app.patients,
  },
  {
    onSelect() {
      Radio.trigger('event-router', 'programs:all');
    },
    id: 'AdminApp',
    isFas: true,
    icon: 'tools',
    text: i18n.app.admin,
  },
  {
    onSelect() {
      Radio.request('auth', 'logout');
    },
    isFas: true,
    icon: 'sign-out-alt',
    text: i18n.app.signOut,
  },
]);

const adminAppNav = new Backbone.Collection([{
  text: i18n.adminApp.programs,
  event: 'programs:all',
  eventArgs: [],
}]);

const patientsAppPatientsNav = new Backbone.Collection([{
  text: i18n.patientsApp.patients.allPatients,
  event: 'patients:all',
  eventArgs: [],
}]);

const patientsAppWorkflowsNav = new Backbone.Collection([
  {
    text: i18n.patientsApp.worklists.ownedByMe,
    event: 'worklist',
    eventArgs: ['owned-by-me'],
  },
  {
    text: i18n.patientsApp.worklists.myRole,
    event: 'worklist',
    eventArgs: ['actions-for-my-role'],
  },
  {
    text: i18n.patientsApp.worklists.newActions,
    event: 'worklist',
    eventArgs: ['new-actions'],
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
    'select': 'onSelect',
  },
  stateEvents: {
    'change:currentApp': 'onChangeCurrentApp',
  },
  onSelect(appName, event, eventArgs) {
    this.setState('currentApp', appName);

    const navMatch = this.getNavMatch(appName, event, _.compact(eventArgs));

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
      return this._navMatch(patientsAppWorkflowsNav, event, eventArgs) || this._navMatch(patientsAppPatientsNav, event, eventArgs);
    }

    if (appName === 'AdminApp') {
      return this._navMatch(adminAppNav, event, eventArgs);
    }
  },
  _navMatch(navCollection, event, eventArgs) {
    return navCollection.find(model => {
      return model.get('event') === event && _.isEqual(model.get('eventArgs'), eventArgs);
    });
  },
  onStart() {
    const currentUser = Radio.request('bootstrap', 'currentUser');
    if (!currentUser.can('admin')) appNavMenu.remove('AdminApp');

    // If there's only 2 options, only sign out
    if (appNavMenu.length === 2) appNavMenu.shift();

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

    const patientsCollectionView = new AppNavCollectionView({ collection: patientsAppPatientsNav });
    const workflowsCollectionView = new AppNavCollectionView({ collection: patientsAppWorkflowsNav });

    navView.showChildView('patients', patientsCollectionView);
    navView.showChildView('worklists', workflowsCollectionView);

    return navView;
  },
  getAdminAppNav() {
    const navView = new AdminAppNav();

    const adminCollectionView = new AppNavCollectionView({ collection: adminAppNav });

    navView.showChildView('admin', adminCollectionView);

    return navView;
  },
});
