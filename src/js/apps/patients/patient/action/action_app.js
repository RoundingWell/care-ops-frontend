import Radio from 'backbone.radio';

import App from 'js/base/app';

export default App.extend({
  beforeStart({ actionId, patientId }) {
    if (!actionId) {
      const currentUser = Radio.request('auth', 'currentUser');
      const currentOrg = Radio.request('auth', 'currentOrg');
      const states = currentOrg.getStates();

      return Radio.request('entities', 'actions:model', {
        _patient: patientId,
        _state: states.at(0).id,
        _clinician: currentUser.id,
        _role: null,
        duration: 0,
        due_date: null,
      });
    }

    return Radio.request('entities', 'fetch:actions:model', actionId);
  },
  onFail() {
    this.stop();
  },
  onStart(options, action) {
    this.action = action;

    const sidebar = Radio.request('sidebar', 'start', 'action', { action });

    this.listenTo(sidebar, 'stop', this.stop);
  },
});
