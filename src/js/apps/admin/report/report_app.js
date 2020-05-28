import Radio from 'backbone.radio';

import App from 'js/base/app';
import { LayoutView, ContextTrailView } from 'js/views/admin/report/report_views';

import intl from 'js/i18n';

export default App.extend({
  onBeforeStart() {
    this.showView(new LayoutView());
    this.getRegion('report').startPreloader();
  },
  beforeStart({ reportId }) {
    return Radio.request('entities', 'fetch:reports:model', reportId);
  },
  onStart(options, report) {
    this.report = report;

    this.showChildView('contextTrail', new ContextTrailView({
      model: this.report,
    }));
  },
  onFail() {
    Radio.request('alert', 'show:error', intl.admin.report.reportApp.notFound);
    Radio.trigger('event-router', 'reports:all');
    this.stop();
  },
});
