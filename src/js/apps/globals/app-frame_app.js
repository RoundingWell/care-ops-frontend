import _ from 'underscore';

import App from 'js/base/app';

import RouterApp from 'js/base/routerapp';

import { AppNavView } from 'js/views/globals/app-nav/app-nav_views';

export default App.extend({
  channelName: 'nav',
  radioRequests: {
    'select': 'select',
  },
  onStart() {
    const TempApp = RouterApp.extend({
      initialize() {
        this.router.route('', 'default', _.noop);
      },
    });

    new TempApp();

    this.showChildView('nav', new AppNavView());
  },
});
