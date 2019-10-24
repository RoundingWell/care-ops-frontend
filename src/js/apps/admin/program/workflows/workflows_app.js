import Radio from 'backbone.radio';

import App from 'js/base/app';

import { LayoutView, ListView } from 'js/views/admin/program/workflows/workflows_views';

export default App.extend({
  viewTriggers: {
    'click:add': 'click:add',
  },
  onBeforeStart({ program }) {
    this.program = program;
    this.showView(new LayoutView({ model: program }));
    this.getRegion('content').startPreloader();
  },
  beforeStart({ program }) {
    return Radio.request('entities', 'fetch:programActions:collection', { program });
  },
  onStart({ program }, actions) {
    this.actions = actions;

    this.showChildView('content', new ListView({ collection: actions }));
  },
  onClickAdd() {
    Radio.trigger('event-router', 'program:action:new', this.program.id);
  },
  onEditAction(action) {
    if (action.isNew()) {
      this.actions.unshift(action);
      return;
    }
    action.trigger('editing', true);
  },
});
