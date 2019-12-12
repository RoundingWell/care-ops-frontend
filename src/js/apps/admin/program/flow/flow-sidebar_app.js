import Radio from 'backbone.radio';

import App from 'js/base/app';

export default App.extend({
  beforeStart({ flowId, programId }) {
    if (!flowId) {
      return Radio.request('entities', 'programFlows:model', {
        _program: programId,
        _role: null,
        status: 'draft',
      });
    }

    return Radio.request('entities', 'programFlows:model', flowId);
  },
  onStart({ programId }, flow) {
    this.flow = flow;

    const sidebar = Radio.request('sidebar', 'start', 'programFlow', { flow, programId });

    this.listenTo(sidebar, 'stop', this.stop);
  },
});
