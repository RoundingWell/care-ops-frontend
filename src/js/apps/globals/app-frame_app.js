import _ from 'underscore';

import Backbone from 'backbone';
import Radio from 'backbone.radio';

import App from 'js/base/app';

import SidebarService from 'js/services/sidebar';

import PatientsMainApp from 'js/apps/patients/patients-main_app';

import { AppNavView, AppNavCollectionView } from 'js/views/globals/app-nav/app-nav_views';

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
    new SidebarService({ region: this.getRegion('sidebar') });
    new PatientsMainApp({ region: this.getRegion('content') });

    this.showAppNav();
  },
  showAppNav() {
    const appNav = new AppNavView({
      model: Radio.request('auth', 'currentUser'),
      currentOrg: Radio.request('auth', 'currentOrg'),
    });

    const patientsCollectionView = new AppNavCollectionView({ collection: patientsNav });
    const viewsCollectionView = new AppNavCollectionView({ collection: viewsNav });

    appNav.showChildView('patients', patientsCollectionView);
    appNav.showChildView('views', viewsCollectionView);

    this.showChildView('nav', appNav);
  },
});
