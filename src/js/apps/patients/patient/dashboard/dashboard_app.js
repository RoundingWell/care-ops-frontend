import Radio from 'backbone.radio';

import App from 'js/base/app';

import AddActionApp from './add-action_app';

import { LayoutView, ListView } from 'js/views/patients/patient/dashboard/dashboard_views';

export default App.extend({
  viewTriggers: {
    'click:add': 'click:add',
  },

  childApps: {
    addAction: AddActionApp,
  },

  onBeforeStart({ patient }) {
    this.patient = patient;
    this.showView(new LayoutView({ model: patient }));
    this.getRegion('content').startPreloader();
  },

  beforeStart({ patient }) {
    const filter = { status: 'queued,started' };
    return Radio.request('entities', 'fetch:patientActions:collection', { patient, filter });
  },

  onStart({ patient }, actions) {
    this.actions = actions;

    this.showChildView('content', new ListView({ collection: actions }));

    if (_DEVELOP_) {
      this.startChildApp('addAction', { region: this.getRegion('addAction') });
    }
  },

  onClickAdd() {
    Radio.trigger('event-router', 'patient:action:new', this.patient.id);
  },

  onEditAction(action) {
    if (action.isNew()) {
      this.actions.unshift(action);
      return;
    }
    action.trigger('editing', true);
  },
});
