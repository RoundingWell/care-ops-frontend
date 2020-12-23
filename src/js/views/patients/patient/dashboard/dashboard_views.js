import anime from 'animejs';
import Radio from 'backbone.radio';

import hbs from 'handlebars-inline-precompile';
import { View, CollectionView, Behavior } from 'marionette';

import { alphaSort } from 'js/utils/sorting';

import 'sass/modules/buttons.scss';
import 'sass/modules/progress-bar.scss';
import 'sass/modules/table-list.scss';

import PreloadRegion from 'js/regions/preload_region';

import { StateComponent, OwnerComponent, DueComponent, TimeComponent, FormButton } from 'js/views/patients/shared/actions_views';

import ActionItemTemplate from './action-item.hbs';
import FlowItemTemplate from './flow-item.hbs';
import LayoutTemplate from './layout.hbs';

import 'sass/domain/action-state.scss';
import '../patient.scss';

const EmptyView = View.extend({
  tagName: 'tr',
  template: hbs`
    <td class="patient__empty-list">
      <h2>{{ @intl.patients.patient.dashboard.dashboardViews.emptyView }}</h2>
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
  onInitialize() {
    if (this.view.model.isNew()) this.$el.addClass('is-selected');
  },
});

const DoneBehavior = Behavior.extend({
  modelEvents: {
    'change:_state': 'onChangeState',
  },
  onChangeState() {
    if (this.view.model.isDone()) {
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
    form: '[data-form-region]',
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
    this.showForm();
  },
  showState() {
    const isDisabled = this.model.isNew();
    const stateComponent = new StateComponent({ stateId: this.model.get('_state'), isCompact: true, state: { isDisabled } });

    this.listenTo(stateComponent, 'change:state', state => {
      this.model.saveState(state);
    });

    this.showChildView('state', stateComponent);
  },
  showOwner() {
    const isDisabled = this.model.isNew();
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
    const isDisabled = this.model.isNew();
    const dueDayComponent = new DueComponent({
      date: this.model.get('due_date'),
      isCompact: true, state: { isDisabled },
      isOverdue: this.model.isOverdue(),
    });

    this.listenTo(dueDayComponent, 'change:due', date => {
      this.model.saveDueDate(date);
    });

    this.showChildView('dueDay', dueDayComponent);
  },
  showDueTime() {
    const isDisabled = this.model.isNew() || !this.model.get('due_date');
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

const FlowItemView = View.extend({
  className: 'table-list__item',
  tagName: 'tr',
  behaviors: [RowBehavior],
  regions: {
    owner: '[data-owner-region]',
  },
  template: FlowItemTemplate,
  templateContext() {
    const stateOptions = this.model.getState().get('options');

    return {
      stateOptions,
    };
  },
  triggers: {
    'click': 'click',
  },
  onClick() {
    Radio.trigger('event-router', 'flow', this.model.id);
  },
  onRender() {
    this.showOwner();
  },
  showOwner() {
    const isDisabled = this.model.isNew();
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
  viewComparator(viewA, viewB) {
    return alphaSort('desc', viewA.model.get('updated_at'), viewB.model.get('updated_at'));
  },
  viewFilter({ model }) {
    return !model.isDone();
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
    addWorkflow: '[data-add-workflow-region]',
  },
  ui: {
    loading: '.js-loading',
  },
  template: LayoutTemplate,
  triggers: {
    'click .js-data-events': 'click:dataEvents',
  },
  onClickDataEvents() {
    Radio.trigger('event-router', 'patient:dataEvents', this.model.id);
  },
  onRender() {
    anime({
      targets: this.ui.loading[0],
      opacity: 0.5,
      loop: true,
      easing: 'easeInOutSine',
      duration: 400,
      direction: 'alternate',
    });
  },
});

export {
  ListView,
  LayoutView,
};
