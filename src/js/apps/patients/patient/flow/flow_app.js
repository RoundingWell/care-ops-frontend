import { bind } from 'underscore';
import Backbone from 'backbone';
import Radio from 'backbone.radio';

import SubRouterApp from 'js/base/subrouterapp';

import ActionApp from 'js/apps/patients/patient/action/action_app';
import PatientSidebarApp from 'js/apps/patients/patient/sidebar/sidebar_app';

import { LayoutView, ContextTrailView, HeaderView, ListView } from 'js/views/patients/patient/flow/flow_views';
import { AddButtonView, i18n } from 'js/views/patients/shared/add-workflow/add-workflow_views';

export default SubRouterApp.extend({
  routerAppName: 'FlowApp',
  childApps: {
    action: ActionApp,
    patient: PatientSidebarApp,
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
      Radio.request('entities', 'fetch:programFlows:model:byPatientFlow', flowId),
      Radio.request('entities', 'fetch:patients:model:byFlow', flowId),
    ];
  },
  onFail() {
    Radio.trigger('event-router', 'notFound');
    this.stop();
  },
  onStart({ currentRoute }, [flow], [actions], [programFlow]) {
    this.flow = flow;
    this.actions = actions;
    this.programActions = programFlow.getActions();

    this.showChildView('contextTrail', new ContextTrailView({
      model: this.flow,
    }));

    this.showHeader();
    this.showAdd();
    this.showActionList();
    this.showSidebar();

    this.listenTo(this.actions, {
      'change:_state': this.onActionChangeState,
      'destroy': this.onActionDestroy,
    });

    this.listenTo(this.flow, 'change:_owner', this.onFlowChangeOwner);

    this.startRoute(currentRoute);
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
  onFlowChangeOwner(flow, _owner) {
    if (_owner.type === 'roles') return;
    const ownerRole = flow.getOwner().getRole();
    this.actions.each(action => {
      if (!action.isDone() && action.getOwner() === ownerRole) action.set({ _owner });
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

  showAdd() {
    const actionOpts = this.programActions.reduce((actions, action) => {
      if (action.get('status') === 'draft') return actions;

      actions.push({
        text: action.get('name'),
        type: action.type,
        onSelect: bind(this.triggerMethod, this, 'add:programAction', action),
      });

      return actions;
    }, []);

    const collection = new Backbone.Collection(actionOpts);

    this.showChildView('addWorkflow', new AddButtonView({
      headingText: i18n.addActionHeadingText,
      lists: [{ collection }],
    }));
  },

  onAddProgramAction(programAction) {
    const action = programAction.getAction({ flowId: this.flow.id });
    action.saveAll().done(() => {
      this.actions.push(action);

      Radio.trigger('event-router', 'flow:action', this.flow.id, action.id);
    });
  },

  showActionList() {
    this.showChildView('actionList', new ListView({
      collection: this.actions,
    }));
  },

  showSidebar() {
    this.startChildApp('patient', {
      region: this.getRegion('sidebar'),
      patient: this.flow.getPatient(),
    });
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
