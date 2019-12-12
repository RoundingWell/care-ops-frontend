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
  },
  onSave({ model }) {
    const isNew = this.flow.isNew();
    this.flow.save(model.pick('name', 'details'))
      .then(() => {
        Radio.request('sidebar', 'close');
        if (isNew) {
          Radio.trigger('event-router', 'program:flow', this.flow.id, this.programId);
        }
      }, ({ responseJSON }) => {
        const errors = this.flow.parseErrors(responseJSON);
        this.getView().showErrors(errors);
      });
  },
  onStop() {
    if (this.flow && this.flow.isNew()) this.flow.destroy();
    this.flow.trigger('editing', false);
    Radio.request('sidebar', 'close');
  },
});
