import Radio from 'backbone.radio';

import App from 'js/base/app';

import { LayoutView, getDeleteModal } from 'js/views/programs/sidebar/flow/flow-sidebar_views';

export default App.extend({
  beforeStart() {
    return Radio.request('entities', 'fetch:tags:collection');
  },
  onStart({ flow }, tags) {
    this.flow = flow;
    this.flow.trigger('editing', true);

    this.showView(new LayoutView({
      flow: this.flow,
      tags,
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
        Radio.trigger('event-router', 'programFlow', this.flow.id);
      });
      return;
    }

    this.flow.save(model.pick('name', 'details'));
  },
  onDelete() {
    const modal = Radio.request('modal', 'show:small', getDeleteModal({
      onSubmit: () => {
        this.flow.destroy({ wait: true })
          .done(() => {
            Radio.trigger('event-router', 'program:details', this.flow.get('_program'));
          })
          .fail(({ responseJSON }) => {
            Radio.request('alert', 'show:apiError', responseJSON);
          });

        modal.destroy();
      },
    }));
  },
  onStop() {
    if (this.flow && this.flow.isNew()) this.flow.destroy();
    this.flow.trigger('editing', false);
    Radio.request('sidebar', 'close');
  },
});
