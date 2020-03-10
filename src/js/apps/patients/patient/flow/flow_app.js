import Radio from 'backbone.radio';

import SubRouterApp from 'js/base/subrouterapp';

import ActionApp from 'js/apps/patients/patient/action/action_app';

import { LayoutView, ContextTrailView, HeaderView, ListView } from 'js/views/patients/patient/flow/flow_views';
import { SidebarView } from 'js/views/patients/patient/sidebar/sidebar_views';

export default SubRouterApp.extend({
  routerAppName: 'FlowApp',
  childApps: {
    action: ActionApp,
  },
  eventRoutes: {
    'flow:action': 'showActionSidebar',
  },
  onBeforeStart() {
    this.showView(new LayoutView());
  },
  beforeStart({ flowId }) {
    return [
      Radio.request('entities', 'fetch:patients:model:byFlow', flowId),
      Radio.request('entities', 'fetch:flows:model', flowId),
      Radio.request('entities', 'fetch:actions:collection:byFlow', flowId),
    ];
  },
  onFail() {
    Radio.trigger('event-router', 'notFound');
    this.stop();
  },
  onStart({ currentRoute }, [patient], [flow], [actions]) {
    this.patient = patient;
    this.flow = flow;
    this.actions = actions;

    this.showChildView('contextTrail', new ContextTrailView({
      model: this.flow,
      patient: this.patient,
    }));

    this.showHeader();
    this.showActionList();
    this.showSidebar();

    this.listenTo(this.actions, {
      'change:_state': this.onActionsChangeState,
      'destroy': this.onActionsDestroy,
    });
  },
  onActionsChangeState(action) {
    const { complete, total } = this.flow.get('_progress');
    const currentOrg = Radio.request('bootstrap', 'currentOrg');
    const states = currentOrg.getStates();
    const current = action.get('_state');
    const previous = action.previous('_state');
    const doneStateId = states.find({ status: 'done' }).id;

    // No change in completion
    if (current !== doneStateId && previous !== doneStateId) return;

    const isNewComplete = current === doneStateId;
    this.flow.set({ _progress: { complete: complete + (isNewComplete ? 1 : -1), total } });
  },
  onActionsDestroy(action) {
    const progress = this.flow.get('_progress');
    let complete = progress.complete;
    const currentOrg = Radio.request('bootstrap', 'currentOrg');
    const states = currentOrg.getStates();
    const current = action.get('_state');
    const doneStateId = states.find({ status: 'done' }).id;

    if (current === doneStateId) complete -= 1;

    this.flow.set({ _progress: { complete: complete, total: progress.total - 1 } });
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

  showActionList() {
    this.showChildView('actionList', new ListView({
      collection: this.actions,
    }));
  },

  showSidebar() {
    this.showChildView('sidebar', new SidebarView({
      model: this.patient,
    }));
  },

  showActionSidebar(flowId, actionId) {
    const actionApp = this.getChildApp('action');

    this.listenToOnce(actionApp, {
      'start'(options, action) {
        action.trigger('editing', true);
      },
    });

    this.startChildApp('action', { actionId });
  },

  onEditFlow() {
    Radio.request('sidebar', 'start', 'flow', { flow: this.flow });
  },
});
