import { extend } from 'underscore';

import App from 'js/base/app';

import ActionSidebarApp from 'js/apps/patients/sidebar/action-sidebar_app';
import FlowSidebarApp from 'js/apps/patients/sidebar/flow-sidebar_app';
import EngagementSidebarApp from 'js/apps/patients/sidebar/engagement-sidebar_app';
import ProgramSidebarApp from 'js/apps/admin/sidebar/program-sidebar_app';
import ProgramFlowSidebarApp from 'js/apps/admin/sidebar/flow-sidebar_app';
import ProgramActionSidebarApp from 'js/apps/admin/sidebar/action-sidebar_app';
import ClinicianSidebarApp from 'js/apps/admin/sidebar/clinician-sidebar_app';

export default App.extend({
  channelName: 'sidebar',

  radioRequests: {
    'close': 'closeSidebar',
    'start': 'startSidebarApp',
  },

  childApps: {
    action: ActionSidebarApp,
    flow: FlowSidebarApp,
    engagement: EngagementSidebarApp,
    program: ProgramSidebarApp,
    programFlow: ProgramFlowSidebarApp,
    programAction: ProgramActionSidebarApp,
    clinician: ClinicianSidebarApp,
  },

  startSidebarApp(appName, appOptions) {
    /* istanbul ignore if */
    if (this.isStarting) return;

    this.isStarting = true;

    this.stopSidebarApp();

    const sidebarOpts = extend({
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
