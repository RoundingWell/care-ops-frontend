import _ from 'underscore';
import Radio from 'backbone.radio';

import SubRouterApp from 'js/base/subrouterapp';

import WorkflowsApp from 'js/apps/admin/program/workflows/workflows_app';
import ActionApp from 'js/apps/admin/program/action/action_app';

import { LayoutView } from 'js/views/admin/program/program_views';
import { SidebarView } from 'js/views/admin/program/sidebar/sidebar-views';

export default SubRouterApp.extend({
  eventRoutes() {
    return {
      'program:details': _.partial(this.startCurrent, 'workflows'),
      'program:action': this.startProgramAction,
      'program:action:new': this.startProgramAction,
      'programFlow:new': this.startFlowSidebar,
    };
  },

  childApps: {
    workflows: WorkflowsApp,
    action: ActionApp,
  },

  currentAppOptions() {
    return {
      region: this.getRegion('content'),
      program: this.getOption('program'),
    };
  },

  onBeforeStart() {
    this.getRegion().startPreloader();
  },

  beforeStart({ programId }) {
    return Radio.request('entities', 'fetch:programs:model', programId);
  },

  onStart({ currentRoute }, program) {
    this.program = program;

    this.setView(new LayoutView({ model: program }));

    this.showSidebar();

    // Show/Empty program sidebar based on app sidebar
    this.listenTo(Radio.channel('sidebar'), {
      'show': this.emptySidebar,
      'close': this.showSidebar,
    });

    this.startRoute(currentRoute);

    this.showView();
  },

  startProgramAction(programId, actionId) {
    const actionApp = this.getChildApp('action');

    this.listenToOnce(actionApp, {
      'start'(options, action) {
        this.editList(action);
      },
      'fail'() {
        this.startCurrent('workflows');
      },
    });

    this.startChildApp('action', { actionId, programId });
  },

  // Triggers event on started workflow for marking the edited item
  editList(item) {
    const currentWorkflow = this.getCurrent() || this.startCurrent('workflows');

    if (!currentWorkflow.isRunning()) {
      this.listenToOnce(currentWorkflow, 'start', () => {
        currentWorkflow.triggerMethod('edit:item', item);
      });
      return;
    }

    currentWorkflow.triggerMethod('edit:item', item);
  },

  startFlowSidebar(programId) {
    const flow = Radio.request('entities', 'programFlows:model', {
      _program: programId,
      _owner: null,
      status: 'draft',
    });

    Radio.request('sidebar', 'start', 'programFlow', { flow });

    this.editList(flow);
  },

  showSidebar() {
    const sidebarView = new SidebarView({ model: this.program });

    this.listenTo(sidebarView, {
      'edit': this.onEdit,
    });

    this.showChildView('sidebar', sidebarView);
  },

  emptySidebar() {
    this.getRegion('sidebar').empty();
  },

  onEdit() {
    Radio.request('sidebar', 'start', 'program', { program: this.program });
  },
});
