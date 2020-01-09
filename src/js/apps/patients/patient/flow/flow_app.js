import _ from 'underscore';
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
      Radio.request('entities', 'fetch:flowActions:collection', flowId),
    ];
  },
  onFail() {
    Radio.trigger('event-router', 'notFound');
    this.stop();
  },
  onStart({ currentRoute }, [patient], [flow], [flowActions]) {
    this.patient = patient;
    this.flow = flow;
    this.flowActions = flowActions;

    this.setActions();

    this.showChildView('contextTrail', new ContextTrailView({
      model: this.flow,
      patient: this.patient,
    }));

    this.showHeader();
    this.showActionList();
    this.showSidebar();

    // Show/Empty patient sidebar based on app sidebar
    this.listenTo(Radio.channel('sidebar'), {
      'show': this.emptySidebar,
      'close': this.showProgramSidebar,
    });
  },

  setActions() {
    this.actions = Radio.request('entities', 'actions:collection', this.flowActions.invoke('getAction'));

    // Update flowActions as actions change
    this.listenTo(this.actions, {
      'destroy'(action) {
        const flowAction = this.flowActions.find({ _action: action.id });
        flowAction.destroy({
          data: JSON.stringify({ data: [_.pick(flowAction, 'id', 'type')] }),
        });
      },
    });
  },

  showHeader() {
    const headerView = new HeaderView({
      model: this.flow,
      actions: this.actions,
    });

    this.listenTo(headerView, {
      'edit': this.onEditFlow,
    });

    this.showChildView('header', headerView);
  },

  showActionList() {
    this.showChildView('actionList', new ListView({
      collection: this.flowActions,
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

  emptySidebar() {
    this.getRegion('sidebar').empty();
  },

  onEditFlow() {
    Radio.request('sidebar', 'start', 'flow', { flow: this.flow });
  },
});
