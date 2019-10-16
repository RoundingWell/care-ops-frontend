import _ from 'underscore';

import Backbone from 'backbone';
import Radio from 'backbone.radio';

import App from 'js/base/app';

import SidebarService from 'js/services/sidebar';

import FormsApp from 'js/apps/forms/forms-main_app';
import PatientsMainApp from 'js/apps/patients/patients-main_app';
import ProgramsMainApp from 'js/apps/programs/programs-main_app';

import { AppNavView, AppNavCollectionView } from 'js/views/globals/app-nav/app-nav_views';

const topNavMenu = new Backbone.Collection([
  {
    onSelect() {
      Radio.trigger('event-router', 'patients:all');
    },
    id: 'your-workspace',
    isFas: false,
    icon: 'window',
    text: 'globals.appNav.topMenu.workspace',
  },
  {
    onSelect() {
      Radio.trigger('event-router', 'programs:all');
    },
    id: 'program-admin',
    isFas: true,
    icon: 'tools',
    text: 'globals.appNav.topMenu.admin',
  },
  {
    onSelect() {
      Radio.request('auth', 'logout');
    },
    id: 'sign-out',
    isFas: true,
    icon: 'sign-out-alt',
    text: 'globals.appNav.topMenu.signOut',
  },
]);

const patientsNav = new Backbone.Collection([{
  titleI18nKey: 'globals.appNav.patients.allPatients',
  event: 'patients:all',
  eventArgs: [],
}]);

const viewsNav = new Backbone.Collection([
  {
    titleI18nKey: 'globals.appNav.views.ownedByMe',
    event: 'view',
    eventArgs: ['owned-by-me'],
  },
  {
    titleI18nKey: 'globals.appNav.views.myRole',
    event: 'view',
    eventArgs: ['actions-for-my-role'],
  },
  {
    titleI18nKey: 'globals.appNav.views.newActions',
    event: 'view',
    eventArgs: ['new-actions'],
  },
  {
    titleI18nKey: 'globals.appNav.views.updatedPastThree',
    event: 'view',
    eventArgs: ['updated-past-three-days'],
  },
  {
    titleI18nKey: 'globals.appNav.views.doneLastThirty',
    event: 'view',
    eventArgs: ['done-last-thirty-days'],
  },
]);

export default App.extend({
  channelName: 'nav',
  radioRequests: {
    'select': 'onSelect',
  },
  onSelect(appName, event, eventArgs) {
    eventArgs = _.compact(eventArgs);
    const navMatch = this._navMatch(viewsNav, event, eventArgs) || this._navMatch(patientsNav, event, eventArgs);

    if (navMatch) {
      this.getChildView('nav').removeSelected();
      navMatch.trigger('selected');
    }
  },
  _navMatch(navCollection, event, eventArgs) {
    return navCollection.find(model => {
      return model.get('event') === event && _.isEqual(model.get('eventArgs'), eventArgs);
    });
  },
  onStart() {
    this.showAppNav();
    new SidebarService({ region: this.getRegion('sidebar') });
    new PatientsMainApp({ region: this.getRegion('content') });
    new ProgramsMainApp({ region: this.getRegion('content') });

    this.initFormsApp();
  },
  initFormsApp() {
    const view = this.getView();
    const formsApp = new FormsApp({ region: this.getRegion('content') });

    this.listenTo(formsApp, {
      start: _.bind(view.toggleNav, view, false),
      stop: _.bind(view.toggleNav, view, true),
    });
  },
  showAppNav() {
    const currentUser = Radio.request('bootstrap', 'currentUser');
    if (!currentUser.can('program-admin')) topNavMenu.remove('program-admin');

    const appNav = new AppNavView({
      model: currentUser,
      currentOrg: Radio.request('bootstrap', 'currentOrg'),
      topNavMenu,
    });

    const patientsCollectionView = new AppNavCollectionView({ collection: patientsNav });
    const viewsCollectionView = new AppNavCollectionView({ collection: viewsNav });

    appNav.showChildView('patients', patientsCollectionView);
    appNav.showChildView('views', viewsCollectionView);

    this.showChildView('nav', appNav);
  },
});
