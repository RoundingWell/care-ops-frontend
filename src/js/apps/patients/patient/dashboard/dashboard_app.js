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
    return Radio.request('entities', 'fetch:patientActions:collection', patient);
  },
  onStart({ patient }, actions) {
    this.actions = actions;
    this.showChildView('content', new ListView({ collection: actions }));
  },
  onClickAdd() {
    const newAction = Radio.request('entities', 'actions:model');
    this.actions.unshift(newAction);
    Radio.request('sidebar', 'show', 'new action');
  },
});
