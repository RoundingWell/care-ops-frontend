import Radio from 'backbone.radio';

import intl from 'js/i18n';

import App from 'js/base/app';

import { LayoutView, ContentView } from 'js/views/patients/sidebar/engagement/engagement-sidebar_views';

export default App.extend({
  onBeforeStart() {
    this.showView(new LayoutView());
    this.getRegion('content').startPreloader();
  },
  beforeStart({ patient }) {
    return Radio.request('entities', 'fetch:patient:engagementSettings', patient.id);
  },
  onStart({ patient }) {
    this.showChildView('content', new ContentView({ model: patient }));
  },
  viewEvents: {
    'close': 'stop',
  },
  onFail() {
    Radio.request('alert', 'show:error', intl.patients.sidebar.engagement.engagementApp.notFound);
    this.stop();
  },
  onStop() {
    Radio.request('sidebar', 'close');
  },

});
