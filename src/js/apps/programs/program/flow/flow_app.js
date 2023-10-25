import Radio from 'backbone.radio';

import SubRouterApp from 'js/base/subrouterapp';

import ActionApp from 'js/apps/programs/program/action/action_app';

import { LayoutView, ContextTrailView, HeaderView, AddActionView, ListView } from 'js/views/programs/program/flow/flow_views';
import { SidebarView } from 'js/views/programs/program/sidebar/sidebar-views';

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
    this.showView(new LayoutView());
  },
  beforeStart({ flowId }) {
    return [
      Radio.request('entities', 'fetch:programs:model:byProgramFlow', flowId),
      Radio.request('entities', 'fetch:programFlows:model', flowId),
      Radio.request('entities', 'fetch:programActions:collection:byProgramFlow', flowId),
    ];
  },
  onFail() {
    Radio.trigger('event-router', 'notFound');
    this.stop();
  },
  onStart({ currentRoute }, program, flow, actions) {
    this.program = program;
    this.flow = flow;
    this.actions = actions;

    this.maintainFlowActions();

    this.showChildView('contextTrail', new ContextTrailView({
      model: this.flow,
      program: this.program,
    }));

    this.showHeader();
    this.showAddAction();
    this.showActionList();
    this.showProgramSidebar();

    this.startRoute(currentRoute);
  },

  maintainFlowActions() {
    this.listenTo(this.actions, 'change:id destroy', () => {
      const programActions = this.actions.map(({ id }) => {
        return { id };
      });
      this.flow.set('_program_actions', programActions);
    });
  },

  showHeader() {
    const headerView = new HeaderView({
      model: this.flow,
    });

    this.listenTo(headerView, {
      'edit': this.onEditFlow,
    });

    this.showChildView('header', headerView);
  },

  showAddAction() {
    const addActionView = new AddActionView();

    this.listenTo(addActionView, {
      'click:addAction': () => {
        Radio.trigger('event-router', 'programFlow:action:new', this.flow.id);
      },
    });

    this.showChildView('addAction', addActionView);
  },

  showActionList() {
    this.showChildView('actionList', new ListView({
      collection: this.actions,
    }));
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

    this.startChildApp('action', { actionId, flowId });
  },

  editAction(action) {
    if (action.isNew()) {
      action.set({ sequence: this.actions.length });
      this.actions.add(action);
      return;
    }

    action.trigger('editing', true);
  },

  onEditProgram() {
    Radio.request('sidebar', 'start', 'program', { program: this.program });
  },

  onEditFlow() {
    Radio.request('sidebar', 'start', 'programFlow', { flow: this.flow });
  },
});
