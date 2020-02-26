import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View, CollectionView } from 'marionette';

import 'sass/modules/table-list.scss';

import PreloadRegion from 'js/regions/preload_region';

import { StateComponent, FlowStateComponent, OwnerComponent, DueDayComponent, DueTimeComponent, AttachmentButton, ActionItemTemplate } from 'js/views/patients/actions/actions_views';

import HeaderTemplate from './header.hbs';

import '../patient.scss';
import './patient-flow.scss';

const ContextTrailView = View.extend({
  initialize({ patient }) {
    this.patient = patient;
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
  onRender() {
    this.showState();
    this.showOwner();
  },
  showState() {
    const stateComponent = new FlowStateComponent({
      model: this.model,
      isCompact: true,
    });

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
  initialize() {
    this.action = this.model.getAction();
    this.flow = this.model.getFlow();

    this.listenTo(this.action, {
      'change': this.render,
      'editing': this.onEditing,
    });

    this.listenTo(this.flow, {
      'change:_state': this.render,
    });
  },
  template: ActionItemTemplate,
  templateContext() {
    return {
      hasAttachment: this.action.getForm(),
    };
  },
  serializeData() {
    return this.action.attributes;
  },
  tagName: 'tr',
  regions: {
    state: '[data-state-region]',
    owner: '[data-owner-region]',
    dueDay: '[data-due-day-region]',
    dueTime: '[data-due-time-region]',
    attachment: '[data-attachment-region]',
  },
  triggers: {
    'click': 'click',
  },
  onClick() {
    Radio.trigger('event-router', 'flow:action', this.model.get('_flow'), this.model.get('_action'));
  },
  onEditing(isEditing) {
    this.$el.toggleClass('is-selected', isEditing);
  },
  onRender() {
    this.showState();
    this.showOwner();
    this.showDueDay();
    this.showDueTime();
    this.showAttachment();
  },
  showState() {
    const isDisabled = this.flow.isDone();
    const stateComponent = new StateComponent({ model: this.action, isCompact: true, state: { isDisabled } });

    this.listenTo(stateComponent, 'change:state', state => {
      this.action.saveState(state);
    });

    this.showChildView('state', stateComponent);
  },
  showOwner() {
    const isDisabled = this.action.isDone() || this.flow.isDone();
    const ownerComponent = new OwnerComponent({ model: this.action, isCompact: true, state: { isDisabled } });

    this.listenTo(ownerComponent, 'change:owner', owner => {
      this.action.saveOwner(owner);
    });

    this.showChildView('owner', ownerComponent);
  },
  showDueDay() {
    const isDisabled = this.action.isDone() || this.flow.isDone();
    const dueDayComponent = new DueDayComponent({ model: this.action, isCompact: true, state: { isDisabled } });

    this.listenTo(dueDayComponent, 'change:due', date => {
      this.action.saveDueDate(date);
    });

    this.showChildView('dueDay', dueDayComponent);
  },
  showDueTime() {
    const isDisabled = this.action.isDone() || this.flow.isDone() || !this.action.get('due_date');
    const dueTimeComponent = new DueTimeComponent({ model: this.action, isCompact: true, state: { isDisabled } });

    this.listenTo(dueTimeComponent, 'change:due_time', time => {
      this.action.saveDueTime(time);
    });

    this.showChildView('dueTime', dueTimeComponent);
  },
  showAttachment() {
    if (!this.action.getForm()) return;

    this.showChildView('attachment', new AttachmentButton({ model: this.action }));
  },
});

const ListView = CollectionView.extend({
  className: 'table-list patient-flow__list',
  tagName: 'table',
  childView: ActionItemView,
  emptyView: EmptyView,
});

const LayoutView = View.extend({
  className: 'patient-flow__frame',
  template: hbs`
    <div class="patient-flow__layout">
      <div data-context-trail-region></div>
      <div data-header-region></div>
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
  },
});

export {
  LayoutView,
  ContextTrailView,
  HeaderView,
  ListView,
};
