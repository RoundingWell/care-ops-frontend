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
      this.action.saveAll(model.attributes)
        .done(() => {
          const flowId = this.action.get('_program_flow');

          if (flowId) {
            Radio.trigger('event-router', 'programFlow:action', flowId, this.action.id);
            return;
          }

          Radio.trigger('event-router', 'program:action', this.action.get('_program'), this.action.id);
        });
      return;
    }

    this.action.save(model.pick('name', 'details'));
  },
  onDelete() {
    this.action.destroy({ wait: true })
      .done(() => {
        this.stop();
      })
      .fail(({ responseJSON }) => {
        Radio.request('alert', 'show:apiError', responseJSON);
      });
  },
  onStop() {
    this.action.trigger('editing', false);
    if (this.action && this.action.isNew()) this.action.destroy();

    Radio.request('sidebar', 'close');
  },
});
