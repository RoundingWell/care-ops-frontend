import App from 'js/base/app';

import { LayoutView } from 'js/views/patients/patient/data-events/data-events_views';

export default App.extend({
  onBeforeStart({ patient }) {
    this.showView(new LayoutView({ model: patient }));
    this.getRegion('content').startPreloader();
  },
});
