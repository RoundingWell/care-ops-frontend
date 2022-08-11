import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'scss/modules/table-list.scss';

import { CheckComponent, StateComponent, OwnerComponent, DueComponent, TimeComponent, FormButton, DetailsTooltip } from 'js/views/patients/shared/actions_views';

import ActionItemTemplate from './action-item.hbs';

import './worklist-list.scss';

const ActionTooltipTemplate = hbs`{{formatMessage (intlGet "patients.worklist.actionViews.actionListTooltips") title=worklistId team=team}}`;

const ActionEmptyView = View.extend({
  tagName: 'tr',
  template: hbs`
    <td class="table-empty-list">
      <h2>{{ @intl.patients.worklist.actionViews.actionEmptyView }}</h2>
    </td>
  `,
});

const ActionItemView = View.extend({
  className: 'table-list__item work-list__item',
  tagName: 'tr',
  template: ActionItemTemplate,
  regions: {
    check: '[data-check-region]',
    state: '[data-state-region]',
    owner: '[data-owner-region]',
    dueDate: '[data-due-date-region]',
    dueTime: '[data-due-time-region]',
    form: '[data-form-region]',
    details: '[data-details-region]',
  },
  templateContext() {
    return {
      flowName: this.flow && this.flow.get('name'),
      patient: this.model.getPatient().attributes,
      owner: this.model.getOwner().get('name'),
      state: this.model.getState().get('name'),
      icon: this.model.hasOutreach() ? 'share-from-square' : 'file-lines',
    };
  },
  initialize({ state }) {
    this.state = state;
    this.flow = this.model.getFlow();

    this.listenTo(state, {
      'select:multiple': this.showCheck,
      'select:none': this.showCheck,
    });
  },
  modelEvents: {
    'change': 'render',
  },
  triggers: {
    'click': 'click',
    'click .js-patient-sidebar-button': 'click:patientSidebarButton',
    'click .js-patient': 'click:patient',
    'click .js-no-click': 'prevent-row-click',
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
  onRender() {
    this.showCheck();
    this.showState();
    this.showOwner();
    this.showDueDate();
    this.showDueTime();
    this.showForm();
    this.showDetailsTooltip();
  },
  toggleSelected(isSelected) {
    this.$el.toggleClass('is-selected', isSelected);
  },
  showCheck() {
    const isSelected = this.state.isSelected(this.model);
    this.toggleSelected(isSelected);
    const checkComponent = new CheckComponent({ state: { isSelected } });

    this.listenTo(checkComponent, {
      'select'(domEvent) {
        this.triggerMethod('select', this, !!domEvent.shiftKey);
      },
      'change:isSelected': this.toggleSelected,
    });

    this.showChildView('check', checkComponent);
  },
  showState() {
    this.stateComponent = new StateComponent({ stateId: this.model.get('_state'), isCompact: true });

    this.listenTo(this.stateComponent, 'change:state', state => {
      this.model.saveState(state);
    });

    this.showChildView('state', this.stateComponent);
  },
  showOwner() {
    const isDisabled = this.model.isDone();
    this.ownerComponent = new OwnerComponent({
      owner: this.model.getOwner(),
      groups: this.model.getPatient().getGroups(),
      isCompact: true,
      state: { isDisabled },
    });

    this.listenTo(this.ownerComponent, 'change:owner', owner => {
      this.model.saveOwner(owner);
    });

    this.showChildView('owner', this.ownerComponent);
  },
  showDueDate() {
    const isDisabled = this.model.isDone();
    this.dueDateComponent = new DueComponent({
      date: this.model.get('due_date'),
      isCompact: true,
      state: { isDisabled },
      isOverdue: this.model.isOverdue(),
    });

    this.listenTo(this.dueDateComponent, 'change:due', date => {
      this.model.saveDueDate(date);
    });

    this.showChildView('dueDate', this.dueDateComponent);
  },
  showDueTime() {
    const isDisabled = this.model.isDone() || !this.model.get('due_date');
    this.dueTimeComponent = new TimeComponent({
      time: this.model.get('due_time'),
      isCompact: true,
      state: { isDisabled },
      isOverdue: this.model.isOverdue(),
    });

    this.listenTo(this.dueTimeComponent, 'change:time', time => {
      this.model.saveDueTime(time);
    });

    this.showChildView('dueTime', this.dueTimeComponent);
  },
  showForm() {
    if (!this.model.getForm()) return;

    this.showChildView('form', new FormButton({ model: this.model }));
  },
  showDetailsTooltip() {
    if (!this.model.get('details')) return;

    this.showChildView('details', new DetailsTooltip({ model: this.model }));
  },
});

export {
  ActionTooltipTemplate,
  ActionEmptyView,
  ActionItemView,
};
