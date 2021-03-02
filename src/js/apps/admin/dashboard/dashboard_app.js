import Radio from 'backbone.radio';

import App from 'js/base/app';
import { LayoutView, ContextTrailView, IframeView } from 'js/views/admin/dashboard/dashboard_views';

import intl from 'js/i18n';

export default App.extend({
  onBeforeStart() {
    this.showView(new LayoutView());
    this.getRegion('dashboard').startPreloader();
  },
  beforeStart({ dashboardId }) {
    return Radio.request('entities', 'fetch:dashboards:model', dashboardId);
  },
  onStart(options, dashboard) {
    this.showChildView('contextTrail', new ContextTrailView({
      model: dashboard,
    }));

    this.showChildView('dashboard', new IframeView({
      model: dashboard,
    }));
  },
  onFail() {
    Radio.request('alert', 'show:error', intl.admin.dashboard.dashboardApp.notFound);
    Radio.trigger('event-router', 'dashboards:all');
    this.stop();
  },
});
