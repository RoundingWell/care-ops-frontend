import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'sass/modules/table-list.scss';

import { StateComponent, OwnerComponent, DueComponent, TimeComponent, AttachmentButton } from 'js/views/patients/shared/actions_views';

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
  className() {
    const state = this.getOption('state');
    const className = 'table-list__item work-list__item';

    if (state.isSelected(this.model)) {
      return `${ className } is-selected`;
    }

    return className;
  },
  tagName: 'tr',
  template: ActionItemTemplate,
  regions: {
    state: '[data-state-region]',
    owner: '[data-owner-region]',
    dueDate: '[data-due-date-region]',
    dueTime: '[data-due-time-region]',
    attachment: '[data-attachment-region]',
  },
  templateContext() {
    return {
      flowName: this.flow && this.flow.get('name'),
      patient: this.model.getPatient().attributes,
      isSelected: this.state.isSelected(this.model),
    };
  },
  initialize({ state }) {
    this.state = state;
    this.flow = this.model.getFlow();
  },
  modelEvents: {
    'change:due_date': 'onChangeDueDate',
  },
  triggers: {
    'click': 'click',
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
  onClickSelect() {
    const isSelected = this.state.isSelected(this.model);
    this.$el.toggleClass('is-selected', !isSelected);
    this.state.toggleSelected(this.model, !isSelected);
    this.render();
  },
  onChangeDueDate() {
    this.showDueTime();
  },
  onRender() {
    this.showState();
    this.showOwner();
    this.showDueDate();
    this.showDueTime();
    this.showAttachment();
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
    const dueDateComponent = new DueComponent({ date: this.model.get('due_date'), isCompact: true, state: { isDisabled } });

    this.listenTo(dueDateComponent, 'change:due', date => {
      this.model.saveDueDate(date);
    });

    this.showChildView('dueDate', dueDateComponent);
  },
  showDueTime() {
    const isDisabled = this.model.isDone() || !this.model.get('due_date');
    const dueTimeComponent = new TimeComponent({ time: this.model.get('due_time'), isCompact: true, state: { isDisabled } });

    this.listenTo(dueTimeComponent, 'change:time', time => {
      this.model.saveDueTime(time);
    });

    this.showChildView('dueTime', dueTimeComponent);
  },
  showAttachment() {
    if (!this.model.getForm()) return;

    this.showChildView('attachment', new AttachmentButton({ model: this.model }));
  },
});

export {
  ActionTooltipTemplate,
  ActionEmptyView,
  ActionItemView,
};
