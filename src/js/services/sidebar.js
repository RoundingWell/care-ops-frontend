import _ from 'underscore';

import App from 'js/base/app';

import ActionSidebarApp from 'js/apps/patients/sidebar/action-sidebar_app';

export default App.extend({
  channelName: 'sidebar',

  radioRequests: {
    'show': 'showSidebar',
    'open': 'openSidebar',
    'close': 'closeSidebar',
    'start': 'startSidebarApp',
  },

  childApps: {
    action: ActionSidebarApp,
  },

  startSidebarApp(appName, appOptions) {
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

  showSidebar(view) {
    this.stopSidebarApp();

    this.showView(view);

    this.getChannel().trigger('show', view);
  },

  openSidebar() {
    this.stopSidebarApp();

    this.getRegion().show(' ');

    this.getChannel().trigger('show');
  },

  closeSidebar() {
    this.stopSidebarApp();

    this.getRegion().empty();

    this.getChannel().trigger('close', this.currentApp);
  },

  stopSidebarApp() {
    if (!this.currentApp) return;

    this.currentApp.stop();

    delete this.currentApp;
  },
});
