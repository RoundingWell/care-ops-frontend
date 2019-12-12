import Backbone from 'backbone';
import Radio from 'backbone.radio';

import App from 'js/base/app';

import intl from 'js/i18n';

import { LayoutView, ListView, AddActionDroplist } from 'js/views/admin/program/workflows/workflows_views';

import 'sass/domain/workflows.scss';

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
    return [
      Radio.request('entities', 'fetch:programActions:collection:byProgram', { programId: program.id }),
      Radio.request('entities', 'fetch:programFlows:collection', { program: program.id }),
    ];
  },
  onStart({ program }, [actions], [flows]) {
    this.actions = new Backbone.Collection([...actions.models, ...flows.models]);
    this.showChildView('content', new ListView({ collection: this.actions }));

    if (!_DEVELOP_) return;

    const actionDroplistMenu = new Backbone.Collection([
      {
        onSelect: () => {
          Radio.trigger('event-router', 'program:action:new', this.program.id);
        },
        isFas: false,
        icon: 'file-alt',
        iconClassName: 'workflows--add-action',
        text: intl.admin.program.workflows.newAction,
      },
      {
        onSelect: () => {
          Radio.trigger('event-router', 'program:flow:new', this.program.id);
        },
        isFas: true,
        icon: 'folder',
        iconClassName: 'workflows--add-flow',
        text: intl.admin.program.workflows.newFlow,
      },
    ]);

    this.showChildView('add', new AddActionDroplist({
      collection: actionDroplistMenu,
    }));
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
  onAddFlow(flow) {
    this.actions.unshift(flow);
    flow.trigger('editing', true);
  },
});
