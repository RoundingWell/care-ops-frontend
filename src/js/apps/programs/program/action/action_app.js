import Radio from 'backbone.radio';

import intl from 'js/i18n';

import { ACTION_OUTREACH, PUBLISH_STATE_STATUS } from 'js/static';

import App from 'js/base/app';

export default App.extend({
  beforeStart({ actionId, programId, flowId }) {
    if (!actionId) {
      return Radio.request('entities', 'programActions:model', {
        _program: programId,
        _program_flow: flowId,
        _owner: null,
        days_until_due: null,
        status: PUBLISH_STATE_STATUS.DRAFT,
        outreach: ACTION_OUTREACH.DISABLED,
      });
    }

    return Radio.request('entities', 'fetch:programActions:model', actionId);
  },
  onFail() {
    Radio.request('alert', 'show:error', intl.programs.program.action.actionApp.notFound);
    this.stop();
  },
  onStart(options, action) {
    const sidebar = Radio.request('sidebar', 'start', 'programAction', { action });

    this.listenTo(sidebar, 'stop', this.stop);
  },
});
