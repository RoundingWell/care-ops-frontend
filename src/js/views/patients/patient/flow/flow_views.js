import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View, CollectionView } from 'marionette';

import 'sass/modules/progress-bar.scss';
import 'sass/modules/table-list.scss';

import PreloadRegion from 'js/regions/preload_region';

import { StateComponent, OwnerComponent, DueComponent, TimeComponent, FormButton } from 'js/views/patients/shared/actions_views';
import { FlowStateComponent, OwnerComponent as FlowOwnerComponent } from 'js/views/patients/shared/flows_views';

import HeaderTemplate from './header.hbs';
import ActionItemTemplate from './action-item.hbs';

import '../patient.scss';
import './patient-flow.scss';

const ContextTrailView = View.extend({
  initialize() {
    this.patient = this.model.getPatient();
  },
  className: 'patient-flow__context-trail',
  template: hbs`
    {{#if hasLatestList}}
      <a class="js-back patient-flow__context-link">
        {{fas "chevron-left"}}{{ @intl.patients.patient.flowViews.contextBackBtn }}
      </a>
      {{fas "chevron-right"}}
    {{/if}}
    <a class="js-patient patient-flow__context-link">{{ firstName }} {{ lastName }}</a>{{fas "chevron-right"}}{{ name }}
  `,
  triggers: {
    'click .js-back': 'click:back',
    'click .js-patient': 'click:patient',
  },
  onClickBack() {
    Radio.request('history', 'go:latestList');
  },
  onClickPatient() {
    Radio.trigger('event-router', 'patient:dashboard', this.patient.id);
  },
  templateContext() {
    return {
      hasLatestList: Radio.request('history', 'has:latestList'),
      firstName: this.patient.get('first_name'),
      lastName: this.patient.get('last_name'),
    };
  },
});

const HeaderView = View.extend({
  className: 'patient-flow__header',
  modelEvents: {
    'editing': 'onEditing',
    'change': 'render',
    'change:_progress': 'onChangeFlowProgress',
  },
  onEditing(isEditing) {
    this.$el.toggleClass('is-selected', isEditing);
  },
  template: HeaderTemplate,
  regions: {
    state: '[data-state-region]',
    owner: '[data-owner-region]',
  },
  triggers: {
    'click': 'edit',
  },
  ui: {
    progress: '.js-progress',
  },
  onRender() {
    this.showState();
    this.showOwner();
  },
  showState() {
    const stateComponent = new FlowStateComponent({
      flow: this.model,
      stateId: this.model.get('_state'),
      isCompact: true,
    });

    this.listenTo(stateComponent, 'change:state', state => {
      this.model.saveState(state);
    });

    this.showChildView('state', stateComponent);
  },
  showOwner() {
    const isDisabled = this.model.isDone();
    const ownerComponent = new FlowOwnerComponent({
      owner: this.model.getOwner(),
      groups: this.model.getPatient().getGroups(),
      isCompact: true,
      state: { isDisabled },
    });

    this.listenTo(ownerComponent, 'change:owner', owner => {
      this.model.saveOwner(owner);
    });

    this.showChildView('owner', ownerComponent);
  },
  onChangeFlowProgress() {
    const prog = this.model.get('_progress');
    this.ui.progress.attr({ value: prog.complete, max: prog.total });
  },
});

const EmptyView = View.extend({
  tagName: 'tr',
  template: hbs`
    <td class="patient-flow__empty-list">
      <h2>{{ @intl.patients.patient.flowViews.emptyView }}</h2>
    </td>
  `,
});

const ActionItemView = View.extend({
  className: 'table-list__item',
  modelEvents: {
    'change': 'render',
    'editing': 'onEditing',
  },
  initialize({ state }) {
    this.state = state;

    this.listenTo(state, {
      'select:all': this.render,
      'select:none': this.render,
    });

    this.flow = this.model.getFlow();

    this.listenTo(this.flow, {
      'change:_state': this.render,
    });
  },
  template: ActionItemTemplate,
  templateContext() {
    return {
      isSelected: this.state.isSelected(this.model),
      hasForm: this.model.getForm(),
    };
  },
  onClickSelect() {
    const isSelected = this.state.isSelected(this.model);
    this.state.toggleSelected(this.model, !isSelected);
    this.render();
  },
  tagName: 'tr',
  regions: {
    state: '[data-state-region]',
    owner: '[data-owner-region]',
    dueDay: '[data-due-day-region]',
    dueTime: '[data-due-time-region]',
    form: '[data-form-region]',
  },
  triggers: {
    'click': 'click',
    'click .js-select': 'click:select',
    'click .js-no-click': 'prevent-row-click',
  },
  onClick() {
    Radio.trigger('event-router', 'flow:action', this.model.get('_flow'), this.model.id);
  },
  onEditing(isEditing) {
    this.$el.toggleClass('is-selected', isEditing);
  },
  onRender() {
    this.showState();
    this.showOwner();
    this.showDueDay();
    this.showDueTime();
    this.showForm();
  },
  showState() {
    const isDisabled = this.flow.isDone();
    const stateComponent = new StateComponent({ stateId: this.model.get('_state'), isCompact: true, state: { isDisabled } });

    this.listenTo(stateComponent, 'change:state', state => {
      this.model.saveState(state);
    });

    this.showChildView('state', stateComponent);
  },
  showOwner() {
    const isDisabled = this.model.isDone() || this.flow.isDone();
    const ownerComponent = new OwnerComponent({
      owner: this.model.getOwner(),
      groups: this.model.getPatient().getGroups(),
      isCompact: true,
      state: { isDisabled },
    });

    this.listenTo(ownerComponent, 'change:owner', owner => {
      this.model.saveOwner(owner);
    });

    this.showChildView('owner', ownerComponent);
  },
  showDueDay() {
    const isDisabled = this.model.isDone() || this.flow.isDone();
    const dueDayComponent = new DueComponent({
      date: this.model.get('due_date'),
      isCompact: true,
      state: { isDisabled },
      isOverdue: this.model.isOverdue(),
    });

    this.listenTo(dueDayComponent, 'change:due', date => {
      this.model.saveDueDate(date);
    });

    this.showChildView('dueDay', dueDayComponent);
  },
  showDueTime() {
    const isDisabled = this.model.isDone() || this.flow.isDone() || !this.model.get('due_date');
    const dueTimeComponent = new TimeComponent({
      time: this.model.get('due_time'),
      isCompact: true, state: { isDisabled },
      isOverdue: this.model.isOverdue(),
    });

    this.listenTo(dueTimeComponent, 'change:time', time => {
      this.model.saveDueTime(time);
    });

    this.showChildView('dueTime', dueTimeComponent);
  },
  showForm() {
    if (!this.model.getForm()) return;

    this.showChildView('form', new FormButton({ model: this.model }));
  },
});

const ListView = CollectionView.extend({
  className: 'table-list patient-flow__list',
  tagName: 'table',
  childView: ActionItemView,
  childViewOptions() {
    return {
      state: this.getOption('state'),
    };
  },
  emptyView: EmptyView,
  viewComparator({ model }) {
    return model.get('sequence');
  },
});

const LayoutView = View.extend({
  className: 'patient-flow__frame',
  template: hbs`
    <div class="patient-flow__layout">
      <div data-context-trail-region></div>
      <div data-header-region></div>
      <div class="patient-flow__actions">
        <div data-select-all-region></div>
        <div data-tools-region></div>
      </div>
      <div data-action-list-region></div>
    </div>
    <div class="patient-flow__sidebar" data-sidebar-region></div>
  `,
  regions: {
    contextTrail: {
      el: '[data-context-trail-region]',
      replaceElement: true,
    },
    header: '[data-header-region]',
    sidebar: '[data-sidebar-region]',
    actionList: {
      el: '[data-action-list-region]',
      regionClass: PreloadRegion,
      replaceElement: true,
    },
    tools: {
      el: '[data-tools-region]',
      replaceElement: true,
    },
    selectAll: {
      el: '[data-select-all-region]',
      replaceElement: true,
    },
  },
});

const SelectAllView = View.extend({
  tagName: 'button',
  className: 'button--checkbox u-margin--r-16',
  attributes() {
    if (this.getOption('isDisabled')) return { disabled: 'disabled' };
  },
  triggers: {
    'click': 'click',
  },
  getTemplate() {
    if (this.getOption('isSelectAll')) return hbs`{{fas "check-square"}}`;
    if (this.getOption('isSelectNone') || this.getOption('isDisabled')) return hbs`{{fal "square"}}`;

    return hbs`{{fas "minus-square"}}`;
  },
});

export {
  LayoutView,
  ContextTrailView,
  HeaderView,
  ListView,
  SelectAllView,
};
