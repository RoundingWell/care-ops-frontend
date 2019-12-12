import _ from 'underscore';
import Radio from 'backbone.radio';

import SubRouterApp from 'js/base/subrouterapp';

import WorkflowsApp from 'js/apps/admin/program/workflows/workflows_app';
import ActionApp from 'js/apps/admin/program/action/action_app';
import FlowSidebarApp from 'js/apps/admin/program/flow/flow-sidebar_app';

import { LayoutView } from 'js/views/admin/program/program_views';
import { SidebarView } from 'js/views/admin/program/sidebar/sidebar-views';

export default SubRouterApp.extend({
  eventRoutes() {
    return {
      'program:details': _.partial(this.startCurrent, 'workflows'),
      'program:action': this.startProgramAction,
      'program:action:new': this.startProgramAction,
      'program:flow:new': this.startFlowSidebar,
    };
  },

  childApps: {
    workflows: WorkflowsApp,
    action: ActionApp,
    flow: FlowSidebarApp,
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
      'start'() {
        this.editActionList(actionApp.action);
      },
      'fail'() {
        this.startCurrent('workflows');
      },
    });

    this.startChildApp('action', { actionId, programId });
  },

  // Triggers event on started action list for marking the edited action
  editActionList(action) {
    const currentActionList = this.getCurrent() || this.startCurrent('workflows');

    if (!currentActionList.isRunning()) {
      this.listenToOnce(currentActionList, 'start', () => {
        currentActionList.triggerMethod('edit:action', action);
      });
      return;
    }

    currentActionList.triggerMethod('edit:action', action);
  },

  addFlow(flow) {
    const currentActionList = this.getCurrent() || this.startCurrent('workflows');

    if (!currentActionList.isRunning()) {
      this.listenToOnce(currentActionList, 'start', () => {
        currentActionList.triggerMethod('add:flow', flow);
      });
      return;
    }

    currentActionList.triggerMethod('add:flow', flow);
  },

  startFlowSidebar(programId) {
    const flowApp = this.getChildApp('flow');

    this.listenToOnce(flowApp, {
      'start'() {
        this.addFlow(flowApp.flow);
      },
      'fail'() {
        this.startCurrent('workflows');
      },
    });

    this.startChildApp('flow', { programId });
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
