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
      Radio.request('entities', 'fetch:flows:model', flowId),
      Radio.request('entities', 'fetch:actions:collection:byFlow', flowId),
    ];
  },
  onFail() {
    Radio.trigger('event-router', 'notFound');
    this.stop();
  },
  onStart({ currentRoute }, [flow], [actions]) {
    this.flow = flow;
    this.actions = actions;

    this.showChildView('contextTrail', new ContextTrailView({
      model: this.flow,
    }));

    this.showHeader();
    this.showActionList();
    this.showSidebar();

    this.listenTo(this.actions, {
      'change:_state': this.onActionChangeState,
      'destroy': this.onActionDestroy,
    });
  },
  onActionChangeState(action) {
    const { complete, total } = this.flow.get('_progress');
    const isDone = action.isDone();

    const prevState = Radio.request('entities', 'states:model', action.previous('_state'));
    const isPrevDone = prevState.get('status') === 'done';

    // No change in completion
    if (!isPrevDone && !isDone) return;

    this.flow.set({ _progress: {
      complete: complete + (isDone ? 1 : -1),
      total,
    } });
  },
  onActionDestroy(action) {
    const { complete, total } = this.flow.get('_progress');
    const isDone = action.isDone();

    this.flow.set({ _progress: {
      complete: complete - (isDone ? 1 : 0),
      total: total - 1,
    } });
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
      model: this.flow.getPatient(),
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
