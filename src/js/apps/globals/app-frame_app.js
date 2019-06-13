import _ from 'underscore';
import Radio from 'backbone.radio';

import App from 'js/base/app';

import RouterApp from 'js/base/routerapp';

import { AppNavView } from 'js/views/globals/app-nav/app-nav_views';

export default App.extend({
  channelName: 'nav',
  radioRequests: {
    'select': 'select',
  },
  beforeStart() {
    return Radio.request('auth', 'bootstrap');
  },
  onStart() {
    const TempApp = RouterApp.extend({
      initialize() {
        this.router.route('', 'default', _.noop);
      },
    });

    new TempApp();

    this.showChildView('nav', new AppNavView({
      model: Radio.request('auth', 'currentUser'),
      currentOrg: Radio.request('auth', 'currentOrg'),
    }));
  },
});
