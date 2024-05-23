import Radio from 'backbone.radio';

import intl from 'js/i18n';

import App from 'js/base/app';

export default App.extend({
  beforeStart({ actionId, patientId }) {
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
