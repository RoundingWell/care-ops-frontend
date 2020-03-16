import _ from 'underscore';

import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View, CollectionView } from 'marionette';

import intl, { renderTemplate } from 'js/i18n';

import 'sass/modules/buttons.scss';
import 'sass/modules/list-pages.scss';
import 'sass/modules/progress-bar.scss';
import 'sass/modules/table-list.scss';

import { PatientStatusIcons } from 'js/static';

import PreloadRegion from 'js/regions/preload_region';

import Droplist from 'js/components/droplist';
import Tooltip from 'js/components/tooltip';

import { StateComponent, OwnerComponent, DueDayComponent, DueTimeComponent, AttachmentButton } from 'js/views/patients/actions/actions_views';

import LayoutTemplate from './layout.hbs';
import ActionItemTemplate from './action-item.hbs';
import FlowItemTemplate from './flow-item.hbs';

import './worklist-list.scss';

const EmptyActionsView = View.extend({
  tagName: 'tr',
  template: hbs`
    <td class="table-empty-list">
      <h2>{{ @intl.patients.worklist.worklistViews.emptyActionsView }}</h2>
    </td>
  `,
});

const EmptyFlowsView = View.extend({
  tagName: 'tr',
  template: hbs`
    <td class="table-empty-list">
      <h2>{{ @intl.patients.worklist.worklistViews.emptyFlowsView }}</h2>
    </td>
  `,
});

const ActionItemView = View.extend({
  className: 'table-list__item',
  tagName: 'tr',
  template: ActionItemTemplate,
  regions: {
    state: '[data-state-region]',
    owner: '[data-owner-region]',
    dueDay: '[data-due-day-region]',
    dueTime: '[data-due-time-region]',
    attachment: '[data-attachment-region]',
  },
  templateContext() {
    return {
      flowName: this.flow && this.flow.get('name'),
      patient: this.model.getPatient().attributes,
    };
  },
  initialize() {
    this.flow = this.model.getFlow();
    this.listenTo(this.model, {
      'change:due_date': this.onChangeDueDate,
    });
  },
  triggers: {
    'click': 'click',
    'click .js-patient': 'click:patient',
  },
  onClick() {
    if (this.flow) {
      Radio.trigger('event-router', 'flow:action', this.flow.id, this.model.id);
      return;
    }

    Radio.trigger('event-router', 'patient:action', this.model.get('_patient'), this.model.id);
  },
  onClickPatient() {
    Radio.trigger('event-router', 'patient:dashboard', this.model.get('_patient'));
  },
  onChangeDueDate() {
    this.showDueTime();
  },
  onRender() {
    this.showState();
    this.showOwner();
    this.showDueDay();
    this.showDueTime();
    this.showAttachment();
  },
  showState() {
    const stateComponent = new StateComponent({ model: this.model, isCompact: true });

    this.listenTo(stateComponent, 'change:state', state => {
      this.model.saveState(state);
    });

    this.showChildView('state', stateComponent);
  },
  showOwner() {
    const isDisabled = this.model.isDone();
    const ownerComponent = new OwnerComponent({ model: this.model, isCompact: true, state: { isDisabled } });

    this.listenTo(ownerComponent, 'change:owner', owner => {
      this.model.saveOwner(owner);
    });

    this.showChildView('owner', ownerComponent);
  },
  showDueDay() {
    const isDisabled = this.model.isDone();
    const dueDayComponent = new DueDayComponent({ model: this.model, isCompact: true, state: { isDisabled } });

    this.listenTo(dueDayComponent, 'change:due', date => {
      this.model.saveDueDate(date);
    });

    this.showChildView('dueDay', dueDayComponent);
  },
  showDueTime() {
    const isDisabled = this.model.isDone() || !this.model.get('due_date');
    const dueTimeComponent = new DueTimeComponent({ model: this.model, isCompact: true, state: { isDisabled } });

    this.listenTo(dueTimeComponent, 'change:due_time', time => {
      this.model.saveDueTime(time);
    });

    this.showChildView('dueTime', dueTimeComponent);
  },
  showAttachment() {
    if (!this.model.getForm()) return;

    this.showChildView('attachment', new AttachmentButton({ model: this.model }));
  },
});

const ReadOnlyFlowStateView = View.extend({
  tagName: 'span',
  className: 'patient__flow-status',
  template: hbs`<span class="action--{{ statusClass }}">{{fas statusIcon}}</span>{{~ remove_whitespace ~}}`,
  templateContext() {
    const status = this.model.getState().get('status');

    return {
      statusClass: _.dasherize(status),
      statusIcon: PatientStatusIcons[status],
    };
  },
});

const FlowItemView = View.extend({
  className: 'table-list__item',
  tagName: 'tr',
  template: FlowItemTemplate,
  regions: {
    state: '[data-state-region]',
    owner: '[data-owner-region]',
  },
  templateContext() {
    return {
      patient: this.model.getPatient().attributes,
    };
  },
  triggers: {
    'click': 'click',
    'click .js-patient': 'click:patient',
  },
  onClick() {
    Radio.trigger('event-router', 'flow', this.model.id);
  },
  onClickPatient() {
    Radio.trigger('event-router', 'patient:dashboard', this.model.get('_patient'));
  },
  onRender() {
    this.showState();
    this.showOwner();
  },
  showState() {
    if (!this.model.isDone()) {
      const readOnlyStateView = new ReadOnlyFlowStateView({ model: this.model });
      this.showChildView('state', readOnlyStateView);
      return;
    }

    const stateComponent = new StateComponent({ model: this.model, isCompact: true });

    this.listenTo(stateComponent, 'change:state', state => {
      this.model.saveState(state);
    });

    this.showChildView('state', stateComponent);
  },
  showOwner() {
    const isDisabled = this.model.isDone();
    const ownerComponent = new OwnerComponent({ model: this.model, isCompact: true, state: { isDisabled } });

    this.listenTo(ownerComponent, 'change:owner', owner => {
      this.model.saveOwner(owner);
    });

    this.showChildView('owner', ownerComponent);
  },
});

const LayoutView = View.extend({
  className: 'flex-region',
  template: LayoutTemplate,
  templateContext() {
    const currentClinician = Radio.request('bootstrap', 'currentUser');

    return {
      role: currentClinician.getRole().get('name'),
      worklistId: _.underscored(this.getOption('worklistId')),
      isFlowList: this.getOption('isFlowList'),
    };
  },
  regions: {
    filters: '[data-filters-region]',
    sort: '[data-sort-region]',
    list: {
      el: '[data-list-region]',
      regionClass: PreloadRegion,
    },
  },
  childViewEvents: {
    'update:listDom': 'fixWidth',
  },
  ui: {
    listHeader: '.js-list-header',
    list: '.js-list',
    tooltip: '.fa-info-circle',
  },
  triggers: {
    'click .js-toggle-actions': 'click:toggleActions',
    'click .js-toggle-flows': 'click:toggleFlows',
  },
  onRender() {
    const isFlowList = this.getOption('isFlowList');
    const template = isFlowList ?
      hbs`{{formatMessage (intlGet "patients.worklist.worklistViews.flowListTooltips") title=worklistId role=role}}` :
      hbs`{{formatMessage (intlGet "patients.worklist.worklistViews.actionListTooltips") title=worklistId role=role}}`;
    new Tooltip({
      message: renderTemplate(template, this.templateContext()),
      uiView: this,
      ui: this.ui.tooltip,
      orientation: 'vertical',
    });
  },
  initialize() {
    const userActivityCh = Radio.channel('user-activity');
    this.listenTo(userActivityCh, 'window:resize', this.fixWidth);
  },
  fixWidth() {
    /* istanbul ignore if */
    if (!this.isRendered()) return;

    const headerWidth = this.ui.listHeader.width();
    const listWidth = this.ui.list.contents().width();
    const listPadding = parseInt(this.ui.list.css('paddingRight'), 10);
    const scrollbarWidth = headerWidth - listWidth;

    this.ui.list.css({ paddingRight: `${ listPadding - scrollbarWidth }px` });
  },
  onClickToggleActions() {
    this.triggerMethod('toggle:listType', 'actions');
  },
  onClickToggleFlows() {
    this.triggerMethod('toggle:listType', 'flows');
  },
});

const ListView = CollectionView.extend({
  className: 'table-list',
  tagName: 'table',
  childView() {
    if (this.getOption('type') === 'actions') {
      return ActionItemView;
    }

    return FlowItemView;
  },
  emptyView() {
    if (this.getOption('type') === 'actions') {
      return EmptyActionsView;
    }

    return EmptyFlowsView;
  },
  onAttach() {
    this.triggerMethod('update:listDom', this);
  },
  /* istanbul ignore next: future proof */
  onRenderChildren() {
    if (!this.isAttached()) return;
    this.triggerMethod('update:listDom', this);
  },
});

const GroupsDropList = Droplist.extend({
  viewOptions: {
    className: 'button-filter',
    template: hbs`{{ name }}{{far "angle-down"}}`,
  },
  picklistOptions: {
    attr: 'name',
  },
});

const SortDropList = Droplist.extend({
  popWidth: 248,
  picklistOptions: {
    headingText: intl.patients.worklist.worklistViews.sortDropList.headingText,
  },
  viewOptions: {
    className: 'button-filter',
    template: hbs`{{far "sort-alt"}}{{text}}{{far "angle-down"}}`,
  },
});

export {
  LayoutView,
  ListView,
  GroupsDropList,
  SortDropList,
};
