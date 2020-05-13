import Radio from 'backbone.radio';

import App from 'js/base/app';

import { SidebarView, EngagementStatusPreloadView, EngagementStatusView } from 'js/views/patients/patient/sidebar/sidebar_views';

export default App.extend({
  onBeforeStart({ patient }) {
    this.patient = patient;

    this.showView(new SidebarView({ model: this.patient }));
    this.showChildView('engagement', new EngagementStatusPreloadView());
  },
  beforeStart({ patient }) {
    return Radio.request('entities', 'fetch:patient:engagementStatus', patient.id);
  },
  onStart() {
    this.showChildView('engagement', new EngagementStatusView({ model: this.patient }));
  },
  onFail() {
    this.showChildView('engagement', new EngagementStatusView({ model: this.patient }));
  },
});
