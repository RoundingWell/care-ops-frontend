import _ from 'underscore';
import Radio from 'backbone.radio';

import App from 'js/base/app';

import { LayoutView, ListView } from 'js/views/patients/patient/dashboard/dashboard_views';

export default App.extend({
  viewTriggers: {
    'click:add': 'click:add',
  },
  onBeforeStart({ patient }) {
    this.showView(new LayoutView({ model: patient }));
    this.getRegion('content').startPreloader();
  },
  beforeStart({ patient }) {
    return Radio.request('entities', 'fetch:patientActions:collection', { patient });
  },
  onStart({ patient }, actions) {
    this.patient = patient;
    this.actions = actions;

    this.showChildView('content', new ListView({ collection: actions }));
  },
  onClickAdd() {
    Radio.trigger('event-router', 'patient:action:new', this.patient.id);
  },
  onEditAction(action) {
    const handler = action.isNew() ? this.addAction : this.editAction;

    if (!this.isRunning()) {
      this.once('start', _.partial(handler, action));
      return;
    }

    handler(action);
  },
  addAction(action) {
    this.actions.unshift(action);
  },
  editAction(action) {
    action.trigger('editing', true);
  },
});
