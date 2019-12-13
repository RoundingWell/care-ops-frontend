// import Backbone from 'backbone';
import Radio from 'backbone.radio';

import intl from 'js/i18n';

import SubRouterApp from 'js/base/subrouterapp';

import ActionApp from 'js/apps/admin/program/action/action_app';

import { LayoutView, ContextTrailView, HeaderView, ListView } from 'js/views/admin/program/flow/flow_views';
import { SidebarView } from 'js/views/admin/program/sidebar/sidebar-views';

export default SubRouterApp.extend({
  routerAppName: 'ProgramFlowApp',
  childApps: {
    flowAction: ActionApp,
  },
  eventRoutes() {
    return {
      'program:flow:action': this.showActionSidebar,
    };
  },
  onBeforeStart() {
    this.showView(new LayoutView());
  },
  beforeStart({ flowId, programId }) {
    return [
      Radio.request('entities', 'fetch:programFlows:model', flowId),
      Radio.request('entities', 'fetch:programs:model', programId),
      Radio.request('entities', 'fetch:programFlowActions:collection', flowId),
    ];
  },
  onFail({ programId }) {
    Radio.request('alert', 'show:error', intl.admin.program.flowApp.notFound);
    Radio.trigger('event-router', 'program:details', programId);
    this.stop();
  },
  onStart({ currentRoute }, [flow], [program], [actions]) {
    this.flow = flow;
    this.program = program;
    this.actions = actions;

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

  showHeader() {
    const headerView = new HeaderView({ model: this.flow });

    this.listenTo(headerView, {
      'edit': this.onEditFlow,
    });

    this.showChildView('header', headerView);
  },

  showActionList() {
    this.showChildView('actionList', new ListView({
      collection: this.actions,
      programId: this.program.id,
    }));
  },

  showProgramSidebar() {
    const sidebarView = new SidebarView({ model: this.program });

    this.listenTo(sidebarView, {
      'edit': this.onEditProgram,
    });

    this.showChildView('sidebar', sidebarView);
  },

  showActionSidebar(programId, flowId, actionId) {
    const actionApp = this.getChildApp('flowAction');

    this.listenToOnce(actionApp, {
      'start'() {
        this.editList(actionApp.action);
      },
      'fail'() {
        this.startRoute('programFlow', {
          programId: this.program.id,
          flowId: this.flow.id,
        });
      },
    });

    this.startChildApp('flowAction', {
      actionId,
      programId,
    });
  },

  editList(item) {
    const currentAction = this.getCurrent() || this.startRoute('programFlow');

    if (!currentAction.isRunning()) {
      this.listenToOnce(currentAction, 'start', () => {
        currentAction.triggerMethod('edit:item', item);
      });
      return;
    }

    currentAction.triggerMethod('edit:item', item);
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
