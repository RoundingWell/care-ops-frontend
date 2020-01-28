import anime from 'animejs';

import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View, CollectionView, Behavior } from 'marionette';

import PreloadRegion from 'js/regions/preload_region';

import { StateComponent, OwnerComponent, DueDayComponent, DueTimeComponent, AttachmentButton } from 'js/views/patients/actions/actions_views';

import ActionItemTemplate from './action-item.hbs';
import FlowItemTemplate from './flow-item.hbs';

import '../patient.scss';

const EmptyView = View.extend({
  tagName: 'tr',
  template: hbs`
    <td class="patient__empty-list">
      <h2>{{ @intl.patients.patient.dataEvents.dataEventsViews.emptyView }}</h2>
    </td>
  `,
});

const RowBehavior = Behavior.extend({
  modelEvents: {
    'editing': 'onEditing',
    'change': 'onChange',
  },
  onChange() {
    this.view.render();
  },
  onEditing(isEditing) {
    this.$el.toggleClass('is-selected', isEditing);
  },
});

const DoneBehavior = Behavior.extend({
  modelEvents: {
    'change:_state': 'onChangeState',
  },
  onChangeState() {
    if (!this.view.model.isDone()) {
      anime({
        targets: this.el,
        delay: 300,
        duration: 500,
        opacity: [1, 0],
        easing: 'easeOutQuad',
        complete: () => {
          this.view.triggerMethod('change:visible');
        },
      });
      return;
    }

    this.$el.css({
      opacity: 1,
    });

    this.view.triggerMethod('change:visible');
  },
});

const ActionItemView = View.extend({
  className: 'table-list__item',
  tagName: 'tr',
  behaviors: [RowBehavior, DoneBehavior],
  regions: {
    state: '[data-state-region]',
    owner: '[data-owner-region]',
    dueDay: '[data-due-day-region]',
    dueTime: '[data-due-time-region]',
    attachment: '[data-attachment-region]',
  },
  template: ActionItemTemplate,
  triggers: {
    'click': 'click',
  },
  onClick() {
    Radio.trigger('event-router', 'patient:action', this.model.get('_patient'), this.model.id);
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
    const ownerComponent = new OwnerComponent({ model: this.model, isCompact: true, state: { isDisabled: true } });

    this.showChildView('owner', ownerComponent);
  },
  showDueDay() {
    const dueDayComponent = new DueDayComponent({ model: this.model, isCompact: true, state: { isDisabled: true } });

    this.showChildView('dueDay', dueDayComponent);
  },
  showDueTime() {
    const dueTimeComponent = new DueTimeComponent({ model: this.model, isCompact: true, state: { isDisabled: true } });

    this.showChildView('dueTime', dueTimeComponent);
  },
  showAttachment() {
    if (!this.model.getForm()) return;

    this.showChildView('attachment', new AttachmentButton({ model: this.model }));
  },
});

const FlowItemView = View.extend({
  className: 'table-list__item',
  tagName: 'tr',
  behaviors: [RowBehavior, DoneBehavior],
  regions: {
    state: '[data-state-region]',
    owner: '[data-owner-region]',
  },
  template: FlowItemTemplate,
  triggers: {
    'click': 'click',
  },
  onClick() {
    Radio.trigger('event-router', 'flow', this.model.id);
  },
  onRender() {
    this.showState();
    this.showOwner();
  },
  showState() {
    const stateComponent = new StateComponent({ model: this.model, isCompact: true });

    this.listenTo(stateComponent, 'change:state', state => {
      this.model.saveState(state);
    });

    this.showChildView('state', stateComponent);
  },
  showOwner() {
    const ownerComponent = new OwnerComponent({ model: this.model, isCompact: true, state: { isDisabled: true } });

    this.showChildView('owner', ownerComponent);
  },
});

const ListView = CollectionView.extend({
  childViewEvents: {
    'change:visible': 'filter',
  },
  className: 'table-list patient__list',
  tagName: 'table',
  childView(item) {
    if (item.type === 'flows') {
      return FlowItemView;
    }

    return ActionItemView;
  },
  emptyView: EmptyView,
  viewComparator({ model }) {
    return - model.moment('updated_at').format('X');
  },
  viewFilter({ model }) {
    return model.isDone();
  },
});

const LayoutView = View.extend({
  className: 'flex-region patient__content',
  regions: {
    content: {
      el: '[data-content-region]',
      regionClass: PreloadRegion,
      replaceElement: true,
    },
  },
  template: hbs`
    <div>
      <button class="patient__tab js-dashboard">
        {{~ @intl.patients.patient.dataEvents.dataEventsViews.dashboardBtn ~}}
      </button>
      <span class="patient__tab--selected">
        {{~ @intl.patients.patient.dataEvents.dataEventsViews.dataEventsBtn ~}}
      </span>
    </div>
    <div data-content-region></div>
  `,
  triggers: {
    'click .js-dashboard': 'click:dashboard',
  },
  onClickDashboard() {
    Radio.trigger('event-router', 'patient:dashboard', this.model.id);
  },
});

export {
  ListView,
  LayoutView,
};
