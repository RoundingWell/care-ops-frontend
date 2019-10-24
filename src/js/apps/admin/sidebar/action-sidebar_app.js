import Radio from 'backbone.radio';

import App from 'js/base/app';

import { LayoutView } from 'js/views/admin/sidebar/action/action-sidebar_views';

export default App.extend({
  onBeforeStart({ action }) {
    this.action = action;

    this.showView(new LayoutView({
      action: this.action,
    }));
  },
  viewEvents: {
    'save': 'onSave',
    'close': 'stop',
    'delete': 'onDelete',
  },
  onSave({ model }) {
    const isNew = model.isNew();

    this.action.saveAll(model.attributes).done(() => {
      if (!isNew) return;

      Radio.trigger('event-router', 'program:action', this.action.get('_program'), this.action.id);
    });
  },
  onDelete() {
    this.action.destroy();
    this.stop();
  },
  onStop() {
    this.action.trigger('editing', false);
    if (this.action && this.action.isNew()) this.action.destroy();

    Radio.request('sidebar', 'close');
  },
});
