import Radio from 'backbone.radio';

import App from 'js/base/app';

import PatientsMainApp from 'js/apps/patients/patients-main_app';

import { AppNavView } from 'js/views/globals/app-nav/app-nav_views';

export default App.extend({
  channelName: 'nav',
  radioRequests: {
    'select': 'select',
  },
  childApps: {
    patients: {
      AppClass: PatientsMainApp,
      startWithParent: true,
    },
  },
  beforeStart() {
    return Radio.request('auth', 'bootstrap');
  },
  onStart() {
    this.showAppNav();
  },
  showAppNav() {
    this.showChildView('nav', new AppNavView({
      model: Radio.request('auth', 'currentUser'),
      currentOrg: Radio.request('auth', 'currentOrg'),
    }));
  },
});
