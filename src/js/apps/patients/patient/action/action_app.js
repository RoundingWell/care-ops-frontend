import Radio from 'backbone.radio';

import intl from 'js/i18n';

import App from 'js/base/app';

export default App.extend({
  beforeStart({ actionId, patientId }) {
    if (!actionId) {
      const currentUser = Radio.request('bootstrap', 'currentUser');
      const currentOrg = Radio.request('bootstrap', 'currentOrg');
      const states = currentOrg.getStates();

      return Radio.request('entities', 'actions:model', {
        _patient: patientId,
        _state: states.at(0).id,
        _owner: {
          type: 'clinicians',
          id: currentUser.id,
        },
        duration: 0,
        due_date: null,
        due_time: null,
      });
    }

    return Radio.request('entities', 'fetch:actions:model', actionId);
  },
  onFail() {
    Radio.request('alert', 'show:error', intl.patients.patient.actionApp.notFound);
    this.stop();
  },
  onStart(options, action) {
    const sidebar = Radio.request('sidebar', 'start', 'action', { action });

    this.listenTo(sidebar, 'stop', this.stop);
  },
});
