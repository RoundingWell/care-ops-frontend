import Radio from 'backbone.radio';

import intl from 'js/i18n';

import App from 'js/base/app';

export default App.extend({
  beforeStart({ actionId, programId }) {
    if (!actionId) {
      return Radio.request('entities', 'programActions:model', {
        _program: programId,
        _role: null,
        days_until_due: null,
        published: false,
      });
    }

    return Radio.request('entities', 'fetch:programActions:model', actionId);
  },
  onFail() {
    Radio.request('alert', 'show:error', intl.admin.program.actionApp.notFound);
    this.stop();
  },
  onStart(options, action) {
    this.action = action;

    const sidebar = Radio.request('sidebar', 'start', 'programAction', { action });

    this.listenTo(sidebar, 'stop', this.stop);
  },
});
