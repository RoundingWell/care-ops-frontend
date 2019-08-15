import _ from 'underscore';

import App from 'js/base/app';

import ActionSidebarApp from 'js/apps/patients/sidebar/action-sidebar_app';

export default App.extend({
  channelName: 'sidebar',

  radioRequests: {
    'close': 'closeSidebar',
    'start': 'startSidebarApp',
  },

  childApps: {
    action: ActionSidebarApp,
  },

  startSidebarApp(appName, appOptions) {
    /* istanbul ignore if */
    if (this.isStarting) return;

    this.isStarting = true;

    this.stopSidebarApp();

    const sidebarOpts = _.extend({
      region: this.getRegion(),
    }, appOptions);

    this.currentApp = this.startChildApp(appName, sidebarOpts);

    this.isStarting = false;

    this.getChannel().trigger('show', this.currentApp);

    return this.currentApp;
  },

  closeSidebar() {
    const currentApp = this.currentApp;

    this.stopSidebarApp();

    this.getRegion().empty();

    this.getChannel().trigger('close', currentApp);
  },

  stopSidebarApp() {
    if (!this.currentApp) return;

    this.currentApp.stop();

    delete this.currentApp;
  },
});
