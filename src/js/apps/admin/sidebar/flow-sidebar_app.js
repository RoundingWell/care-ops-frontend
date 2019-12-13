import Radio from 'backbone.radio';

import App from 'js/base/app';

import { LayoutView } from 'js/views/admin/sidebar/flow/flow-sidebar_views';

export default App.extend({
  onBeforeStart({ flow, programId }) {
    this.flow = flow;
    this.programId = programId;
    this.flow.trigger('editing', true);

    this.showView(new LayoutView({
      flow: this.flow,
    }));
  },
  viewEvents: {
    'save': 'onSave',
    'close': 'stop',
    'delete': 'onDelete',
  },
  onSave({ model }) {
    if (model.isNew()) {
      this.flow.saveAll(model.attributes).done(() => {
        Radio.trigger('event-router', 'program:flow', this.flow.id, this.programId);
      });
      return;
    }

    this.flow.save(model.pick('name', 'details'));
  },
  onDelete() {
    // TODO Delete confirmation modal
    this.flow.destroy();
    this.stop();
  },
  onStop() {
    if (this.flow && this.flow.isNew()) this.flow.destroy();
    this.flow.trigger('editing', false);
    Radio.request('sidebar', 'close');
  },
});
