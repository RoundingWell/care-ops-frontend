import _ from 'underscore';
import Radio from 'backbone.radio';

import App from 'js/base/app';

import { LayoutView, ListView } from 'js/views/patients/patient/data-events/data-events_views';

export default App.extend({
  onBeforeStart({ patient }) {
    this.showView(new LayoutView({ model: patient }));
    this.getRegion('content').startPreloader();
  },
  beforeStart({ patient }) {
    const filter = { status: 'done' };
    return Radio.request('entities', 'fetch:patientActions:collection', { patient, filter });
  },
  onStart({ patient }, actions) {
    this.showChildView('content', new ListView({ collection: actions }));
  },
  onEditAction(action) {
    if (!this.isRunning()) {
      this.once('start', _.partial(this.editAction, action));
      return;
    }

    this.editAction(action);
  },
  editAction(action) {
    action.trigger('editing', true);
  },
});
