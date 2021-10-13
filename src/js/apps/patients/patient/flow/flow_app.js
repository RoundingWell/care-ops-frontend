import { bind } from 'underscore';
import Backbone from 'backbone';
import Radio from 'backbone.radio';

import { PUBLISH_STATE_STATUS } from 'js/static';
import intl, { renderTemplate } from 'js/i18n';

import SubRouterApp from 'js/base/subrouterapp';

import StateModel from './flow_state';

import ActionApp from 'js/apps/patients/patient/action/action_app';
import BulkEditActionsApp from 'js/apps/patients/sidebar/bulk-edit-actions_app';
import PatientSidebarApp from 'js/apps/patients/patient/sidebar/sidebar_app';

import { LayoutView, ContextTrailView, HeaderView, ListView, SelectAllView } from 'js/views/patients/patient/flow/flow_views';
import { BulkEditButtonView, BulkEditActionsSuccessTemplate, BulkDeleteActionsSuccessTemplate } from 'js/views/patients/shared/bulk-edit/bulk-edit_views';
import { AddButtonView, i18n } from 'js/views/patients/shared/add-workflow/add-workflow_views';

export default SubRouterApp.extend({
  StateModel,
  routerAppName: 'FlowApp',
  childApps: {
    action: ActionApp,
    patient: PatientSidebarApp,
    bulkEditActions: BulkEditActionsApp,
  },
  eventRoutes: {
    'flow:action': 'showActionSidebar',
  },
  stateEvents: {
    'change:selectedActions': 'onChangeSelected',
  },
  onChangeSelected() {
    this.toggleBulkSelect();
  },
  onBeforeStart() {
    this.resetStateDefaults();
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
    this.addOpts = this.getAddOpts();

    this.showChildView('contextTrail', new ContextTrailView({
      model: this.flow,
    }));

    this.showHeader();
    this.toggleBulkSelect();
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
    const isPrevDone = prevState.isDone();

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

  getAddOpts() {
    const actionOpts = this.programActions.reduce((actions, action) => {
      if (action.get('status') === PUBLISH_STATE_STATUS.DRAFT) return actions;

      actions.push({
        text: action.get('name'),
        type: action.type,
        hasOutreach: action.hasOutreach(),
        onSelect: bind(this.triggerMethod, this, 'add:programAction', action),
      });

      return actions;
    }, []);

    return new Backbone.Collection(actionOpts);
  },

  showAdd() {
    this.showChildView('tools', new AddButtonView({
      headingText: i18n.addActionHeadingText,
      lists: [{ collection: this.addOpts }],
    }));
  },

  toggleBulkSelect() {
    this.selected = this.getState().getSelected(this.actions);

    this.showSelectAll();

    if (this.selected.length) {
      this.showBulkEditButtonView();
      return;
    }

    this.showAdd();
  },
  showBulkEditButtonView() {
    const bulkEditButtonView = this.showChildView('tools', new BulkEditButtonView({
      tagName: 'span',
      collection: this.selected,
    }));

    this.listenTo(bulkEditButtonView, {
      'click:cancel': this.onClickBulkCancel,
      'click:edit': this.onClickBulkEdit,
    });
  },
  onClickBulkCancel() {
    this.getState().clearSelected();
  },
  onClickBulkEdit() {
    const app = this.startChildApp('bulkEditActions', {
      state: { collection: this.selected },
    });

    this.listenTo(app, {
      'save'(saveData) {
        this.selected.save(saveData)
          .done(() => {
            this.showUpdateSuccess(this.selected.length);
            app.stop();
            this.getState().clearSelected();
          })
          .fail(() => {
            Radio.request('alert', 'show:error', intl.patients.worklist.worklistApp.bulkEditFailure);
            this.getState().clearSelected();
            this.restart();
          });
      },
      'delete'() {
        const itemCount = this.selected.length;

        this.selected.destroy().then(() => {
          this.showDeleteSuccess(itemCount);
          app.stop();
          this.getState().clearSelected();
        });
      },
    });
  },
  showDeleteSuccess(itemCount) {
    Radio.request('alert', 'show:success', renderTemplate(BulkDeleteActionsSuccessTemplate, { itemCount }));
  },
  showUpdateSuccess(itemCount) {
    Radio.request('alert', 'show:success', renderTemplate(BulkEditActionsSuccessTemplate, { itemCount }));
  },
  showDisabledSelectAll() {
    this.showChildView('selectAll', new SelectAllView({ isDisabled: true }));
  },
  showSelectAll() {
    if (!this.actions.length) {
      this.showDisabledSelectAll();
      return;
    }
    const isSelectAll = this.selected.length === this.actions.length;
    const isSelectNone = !this.selected.length;
    const selectAllView = new SelectAllView({
      isSelectAll,
      isSelectNone,
    });

    this.listenTo(selectAllView, 'click', this.onClickBulkSelect);

    this.showChildView('selectAll', selectAllView);
  },
  onClickBulkSelect() {
    if (this.selected.length === this.actions.length) {
      this.getState().clearSelected();
      return;
    }

    this.getState().selectAll(this.actions);
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
      state: this.getState(),
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
