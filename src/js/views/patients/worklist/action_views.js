import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'sass/modules/table-list.scss';

import { StateComponent, OwnerComponent, DueComponent, TimeComponent, FormButton, DetailsTooltip } from 'js/views/patients/shared/actions_views';

import ActionItemTemplate from './action-item.hbs';

import './worklist-list.scss';

const ActionTooltipTemplate = hbs`{{formatMessage (intlGet "patients.worklist.actionViews.actionListTooltips") title=worklistId role=role}}`;

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
      isSelected: this.state.isSelected(this.model),
      owner: this.model.getOwner().get('name'),
      state: this.model.getState().get('name'),
      icon: this.model.hasOutreach() ? 'share-square' : 'file-alt',
    };
  },
  initialize({ state }) {
    this.state = state;
    this.flow = this.model.getFlow();

    this.listenTo(state, {
      'select:multiple': this.render,
      'select:none': this.render,
    });
  },
  modelEvents: {
    'change:due_date': 'onChangeDueDateTime',
    'change:due_time': 'onChangeDueDateTime',
  },
  triggers: {
    'click': 'click',
    'click .js-patient-sidebar-button': 'click:patientSidebarButton',
    'click .js-patient': 'click:patient',
    'click .js-select': 'click:select',
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
  onClickSelect(view, domEvent) {
    this.triggerMethod('select', view, !!domEvent.shiftKey);
    this.render();
  },
  onChangeDueDateTime() {
    this.showDueDate();
    this.showDueTime();
  },
  onRender() {
    this.$el.toggleClass('is-selected', this.state.isSelected(this.model));
    this.showState();
    this.showOwner();
    this.showDueDate();
    this.showDueTime();
    this.showForm();
    this.showDetailsTooltip();
  },
  showState() {
    const stateComponent = new StateComponent({ stateId: this.model.get('_state'), isCompact: true });

    this.listenTo(stateComponent, 'change:state', state => {
      this.model.saveState(state);
    });

    this.showChildView('state', stateComponent);
  },
  showOwner() {
    const isDisabled = this.model.isDone();
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
  showDueDate() {
    const isDisabled = this.model.isDone();
    const dueDateComponent = new DueComponent({
      date: this.model.get('due_date'),
      isCompact: true,
      state: { isDisabled },
      isOverdue: this.model.isOverdue(),
    });

    this.listenTo(dueDateComponent, 'change:due', date => {
      this.model.saveDueDate(date);
    });

    this.showChildView('dueDate', dueDateComponent);
  },
  showDueTime() {
    const isDisabled = this.model.isDone() || !this.model.get('due_date');
    const dueTimeComponent = new TimeComponent({
      time: this.model.get('due_time'),
      isCompact: true,
      state: { isDisabled },
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
