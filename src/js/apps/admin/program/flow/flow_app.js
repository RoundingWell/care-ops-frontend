import _ from 'underscore';
import Radio from 'backbone.radio';

import SubRouterApp from 'js/base/subrouterapp';

import ActionApp from 'js/apps/admin/program/action/action_app';

import { LayoutView, ContextTrailView, HeaderView, ListView } from 'js/views/admin/program/flow/flow_views';
import { SidebarView } from 'js/views/admin/program/sidebar/sidebar-views';

export default SubRouterApp.extend({
  routerAppName: 'ProgramFlowApp',
  childApps: {
    action: ActionApp,
  },
  eventRoutes: {
    'programFlow:action': 'showActionSidebar',
    'programFlow:action:new': 'showActionSidebar',
  },
  onBeforeStart() {
    this.setState('preventSort', false);
    this.showView(new LayoutView());
  },
  beforeStart({ flowId }) {
    return [
      Radio.request('entities', 'fetch:programs:model:byProgramFlow', flowId),
      Radio.request('entities', 'fetch:programFlows:model', flowId),
      Radio.request('entities', 'fetch:programFlowActions:collection', flowId),
    ];
  },
  onFail() {
    Radio.trigger('event-router', 'notFound');
    this.stop();
  },
  onStart({ currentRoute }, [program], [flow], [flowActions]) {
    this.program = program;
    this.flow = flow;
    this.flowActions = flowActions;

    this.setProgramActions();

    this.showChildView('contextTrail', new ContextTrailView({
      model: this.flow,
      program: this.program,
    }));

    this.showHeader();
    this.showActionList();
    this.showProgramSidebar();

    // Show/Empty program sidebar based on app sidebar
    this.listenTo(Radio.channel('sidebar'), {
      'show': this.emptySidebar,
      'close': this.showProgramSidebar,
    });
  },

  setProgramActions() {
    this.programActions = this.flow.getActions();
    const flowActionRelations = this.flow.get('_program_flow_actions');

    // Update flowActions as programActions change
    this.listenTo(this.programActions, {
      'change:id'(action) {
        const flowAction = this.flowActions.getByAction(action);
        flowAction.saveAll({ _program_action: action.id })
          .done(() => {
            this.setState('preventSort', false);
          });
        this.flow.set('_program_flow_actions', _.union(flowActionRelations, [{ id: flowAction.id }]));
        Radio.trigger('event-router', 'programFlow:action', this.flow.id, action.id);
      },
      'destroy'(action) {
        const flowAction = this.flowActions.getByAction(action);
        flowAction.destroy({
          data: JSON.stringify({ data: [_.pick(flowAction, 'id', 'type')] }),
        });
        this.flow.set('_program_flow_actions', _.without(flowActionRelations, [{ id: flowAction.id }]));
        this.setState('preventSort', false);
      },
    });

    // Update programActions as flowActions change
    this.listenTo(this.flowActions, 'update', () => {
      this.programActions.reset(this.flowActions.invoke('getAction'));
    });
  },

  showHeader() {
    const headerView = new HeaderView({
      model: this.flow,
      programActions: this.programActions,
    });

    this.listenTo(headerView, {
      'edit': this.onEditFlow,
      'click:addAction': () => {
        Radio.trigger('event-router', 'programFlow:action:new', this.flow.id);
      },
    });

    this.showChildView('header', headerView);
  },

  showActionList() {
    this.showChildView('actionList', new ListView({
      collection: this.flowActions,
    }));

    this.listenTo(this.flowActions, 'destroy', flowAction => {
      if (flowAction.isNew()) return;
      this.flowActions.updateSequences();
    });
  },

  showProgramSidebar() {
    const sidebarView = new SidebarView({ model: this.program });

    this.listenTo(sidebarView, {
      'edit': this.onEditProgram,
    });

    this.showChildView('sidebar', sidebarView);
  },

  showActionSidebar(flowId, actionId) {
    const actionApp = this.getChildApp('action');

    this.listenToOnce(actionApp, {
      'start'(options, action) {
        this.editAction(action);
      },
    });

    this.startChildApp('action', { actionId });
  },

  editAction(action) {
    if (action.isNew()) {
      this.setState('preventSort', true);

      this.flowActions.add({
        sequence: this.flowActions.length,
        _program_flow: this.flow.id,
        _new_action: action,
      });
      return;
    }

    action.trigger('editing', true);
  },

  emptySidebar() {
    this.getRegion('sidebar').empty();
  },

  onEditProgram() {
    Radio.request('sidebar', 'start', 'program', { program: this.program });
  },

  onEditFlow() {
    Radio.request('sidebar', 'start', 'programFlow', { flow: this.flow });
  },
});
