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
    if (model.isNew()) {
      this.action.saveAll(model.attributes).done(() => {
        // Don't redirect for program-flow-actions
        if (!this.action.get('_program')) return;

        Radio.trigger('event-router', 'program:action', this.action.get('_program'), this.action.id);
      });
      return;
    }

    this.action.save(model.pick('name', 'details'));
  },
  onDelete() {
    // Fake a destroy for program-flow-actions
    if (!this.action.get('_program')) {
      this.action.stopListening();
      this.action.trigger('destroy', this.action, this.action.collection);
      this.stop();
      return;
    }

    this.action.destroy();
    this.stop();
  },
  onStop() {
    this.action.trigger('editing', false);
    if (this.action && this.action.isNew()) this.action.destroy();

    Radio.request('sidebar', 'close');
  },
});
