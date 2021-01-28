import { bind, some } from 'underscore';
import Backbone from 'backbone';
import dayjs from 'dayjs';
import hbs from 'handlebars-inline-precompile';
import Radio from 'backbone.radio';
import { View } from 'marionette';

import intl from 'js/i18n';

import Optionlist from 'js/components/optionlist';

import { StateComponent, OwnerComponent, DueComponent, TimeComponent, DurationComponent } from 'js/views/patients/shared/actions_views';

import BulkEditActionBodyTemplate from './bulk-edit-action-body.hbs';
import BulkEditFlowBodyTemplate from './bulk-edit-flow-body.hbs';

import './bulk-edit.scss';

const i18n = intl.patients.shared.bulkEdit.bulkEditViews;

function getIsOverdue(date, time) {
  if (!date) return false;

  const dueDateTime = dayjs(`${ date } ${ time }`);

  return dueDateTime.isBefore(dayjs(), 'day') || dueDateTime.isBefore(dayjs(), 'minute');
}

const FlowsStateComponent = StateComponent.extend({
  onPicklistSelect({ model }) {
    // Selected done
    if (model.get('status') === 'done' && this.getOption('flows')) {
      this.shouldSelectDone(model);
      return;
    }

    this.setSelectedStatus(model);
  },
  shouldSelectDone(model) {
    const flows = this.getOption('flows');
    const flowsIncomplete = some(flows.invoke('isAllDone'), complete => !complete);

    if (!flowsIncomplete) {
      this.setSelectedStatus(model);
      return;
    }

    // We must hide the droplist before showing the modal
    this.popRegion.empty();

    const modal = Radio.request('modal', 'show:small', {
      bodyText: i18n.flowsStateComponent.doneModal.bodyText,
      headingText: i18n.flowsStateComponent.doneModal.headingText,
      submitText: i18n.flowsStateComponent.doneModal.submitText,
      buttonClass: 'button--green',
      onSubmit: () => {
        this.setSelectedStatus(model);
        modal.destroy();
      },
    });
  },
  setSelectedStatus(model) {
    this.setState('selected', model);
    this.popRegion.empty();
  },
});

const BulkEditButtonView = View.extend({
  template: hbs`
   <button class="button--blue js-bulk-edit">
      {{#if isFlowList}}
        {{formatMessage  (intlGet "patients.shared.bulkEdit.bulkEditViews.bulkEditButtonView.editFlows") itemCount=items.length}}
      {{else}}
        {{formatMessage  (intlGet "patients.shared.bulkEdit.bulkEditViews.bulkEditButtonView.editActions") itemCount=items.length}}
      {{/if}}
    </button>
    <span class="bulk-edit__cancel-button js-cancel">{{@intl.patients.shared.bulkEdit.bulkEditViews.bulkEditButtonView.cancel}}</span>
  `,
  templateContext() {
    return {
      isFlowList: this.getOption('isFlowType'),
    };
  },
  triggers: {
    'click .js-cancel': 'click:cancel',
    'click .js-bulk-edit': 'click:edit',
  },
});

const BulkEditActionsHeaderView = View.extend({
  template: hbs`
    <div class="flex">
      <div class="flex-grow">
      <h3 class="sidebar__heading">{{formatMessage  (intlGet "patients.shared.bulkEdit.bulkEditViews.bulkEditActionsHeaderView.headingText") itemCount=items.length}}</h3>
      </div>
      {{#if isDevelop}}
        <div>
          <button class="button--icon u-margin--r-8 js-menu">{{far "ellipsis-h"}}</button>
        </div>
      {{/if}}
    </div>
  `,
  templateContext() {
    return {
      isDevelop: _DEVELOP_,
    };
  },
  triggers: {
    'click @ui.menu': 'click:menu',
  },
  ui: {
    menu: '.js-menu',
  },
  onClickMenu() {
    const itemCount = this.collection.length;
    const menuOptions = new Backbone.Collection([
      {
        onSelect: bind(this.triggerMethod, this, 'confirm:delete'),
      },
    ]);

    const optionlist = new Optionlist({
      ui: this.ui.menu,
      uiView: this,
      headingText: i18n.bulkEditActionsHeaderView.menuOptions.headingText,
      itemTemplate: hbs`<span class="sidebar__delete-icon">{{far "trash-alt"}}</span>{{formatMessage  (intlGet "patients.shared.bulkEdit.bulkEditViews.bulkEditActionsHeaderView.menuOptions.delete") itemCount=itemCount}}`,
      itemTemplateContext: { itemCount },
      lists: [{ collection: menuOptions }],
      align: 'right',
      popWidth: 248,
    });

    optionlist.show();
  },
  onConfirmDelete() {
    const modal = Radio.request('modal', 'show:small', {
      bodyText: i18n.confirmDeleteActionsModal.bodyText,
      headingText: i18n.confirmDeleteActionsModal.headingText,
      submitText: i18n.confirmDeleteActionsModal.submitText,
      buttonClass: 'button--red',
      onSubmit: () => {
        modal.destroy();
        this.triggerMethod('delete', this.collection);
      },
    });
  },
});

const BulkEditFlowsHeaderView = View.extend({
  template: hbs`
    <div class="flex">
      <div class="flex-grow">
        <h3 class="sidebar__heading">{{formatMessage  (intlGet "patients.shared.bulkEdit.bulkEditViews.bulkEditFlowsHeaderView.headingText") itemCount=items.length}}</h3>
      </div>
      <div>
        <button class="button--icon u-margin--r-8 js-menu">{{far "ellipsis-h"}}</button>
      </div>
    </div>
  `,
  triggers: {
    'click @ui.menu': 'click:menu',
  },
  ui: {
    menu: '.js-menu',
  },
  onClickMenu() {
    const itemCount = this.collection.length;
    const menuOptions = new Backbone.Collection([
      {
        onSelect: bind(this.triggerMethod, this, 'confirm:delete'),
      },
    ]);

    const optionlist = new Optionlist({
      ui: this.ui.menu,
      uiView: this,
      headingText: i18n.bulkEditFlowsHeaderView.menuOptions.headingText,
      itemTemplate: hbs`<span class="sidebar__delete-icon">{{far "trash-alt"}}</span>{{formatMessage  (intlGet "patients.shared.bulkEdit.bulkEditViews.bulkEditFlowsHeaderView.menuOptions.delete") itemCount=itemCount}}`,
      itemTemplateContext: { itemCount },
      lists: [{ collection: menuOptions }],
      align: 'right',
      popWidth: 248,
    });

    optionlist.show();
  },
  onConfirmDelete() {
    const modal = Radio.request('modal', 'show:small', {
      bodyText: i18n.confirmDeleteFlowsModal.bodyText,
      headingText: i18n.confirmDeleteFlowsModal.headingText,
      submitText: i18n.confirmDeleteFlowsModal.submitText,
      buttonClass: 'button--red',
      onSubmit: () => {
        modal.destroy();
        this.triggerMethod('delete', this.collection);
      },
    });
  },
});

const BulkEditActionsBodyView = View.extend({
  modelEvents: {
    'change:stateMulti': 'showState',
    'change:ownerMulti': 'showOwner',
    'change:dateMulti': 'showDueDateTime',
    'change:date': 'showDueDateTime',
    'change:timeMulti': 'showDueTime',
    'change:durationMulti': 'showDuration',
  },
  className: 'bulk-edit__body',
  template: BulkEditActionBodyTemplate,
  regions: {
    state: '[data-state-region]',
    owner: '[data-owner-region]',
    dueDate: '[data-due-date-region]',
    dueTime: '[data-due-time-region]',
    duration: '[data-duration-region]',
  },
  onRender() {
    this.showState();
    this.showOwner();
    this.showDueDateTime();
    this.showDuration();
  },
  getStateComponent() {
    if (this.model.get('stateMulti')) {
      return new StateComponent({
        viewOptions: {
          className: 'button-secondary w-100',
          template: hbs`{{fas "dot-circle"}}<span class="action--gray">{{ @intl.patients.shared.bulkEdit.bulkEditViews.bulkStateDefaultText }}</span>`,
        },
      });
    }

    return new StateComponent({ stateId: this.model.get('stateId') });
  },
  getOwnerComponent() {
    const groups = this.model.getGroups();
    const infoText = groups.length ? null : i18n.bulkOwnerInfoText;

    if (this.model.get('ownerMulti')) {
      return new OwnerComponent({
        groups,
        viewOptions: {
          className: 'button-secondary w-100',
          template: hbs`{{far "user-circle"}}<span class="action--gray">{{ @intl.patients.shared.bulkEdit.bulkEditViews.bulkOwnerDefaultText }}</span>`,
        },
        infoText,
      });
    }

    return new OwnerComponent({
      owner: this.model.get('owner'),
      groups,
      infoText,
    });
  },
  getDueDateComponent() {
    if (this.model.get('dateMulti')) {
      return new DueComponent({
        viewOptions: {
          tagName: 'button',
          className: 'button-secondary w-100 due-component',
          triggers: {
            'click': 'click',
          },
          template: hbs`{{far "calendar-alt"}}<span class="action--gray">{{ @intl.patients.shared.bulkEdit.bulkEditViews.bulkDueDateDefaultText }}</span>`,
        },
      });
    }

    const isOverdue = getIsOverdue(this.model.get('date'));

    return new DueComponent({
      date: this.model.get('date'),
      isOverdue,
    });
  },
  getDueTimeComponent() {
    if (this.model.get('timeMulti')) {
      return new TimeComponent({
        viewOptions: {
          attributes: {
            disabled: this.model.get('dateMulti'),
          },
          className: 'button-secondary time-component w-100',
          template: hbs`{{far "clock"}} <span class="action--gray">{{ @intl.patients.shared.bulkEdit.bulkEditViews.bulkDueTimeDefaultText }}</span>`,
        },
      });
    }

    const time = this.model.get('time');
    const isDisabled = (this.model.get('dateMulti') && !time) || !this.model.get('date');
    const isOverdue = getIsOverdue(this.model.get('date'), time);

    return new TimeComponent({
      time,
      state: { isDisabled },
      isOverdue,
    });
  },
  getDurationComponent() {
    if (this.model.get('durationMulti')) {
      return new DurationComponent({
        viewOptions: {
          className: 'button-secondary w-100',
          template: hbs`{{far "stopwatch"}}<span class="action--gray">{{ @intl.patients.shared.bulkEdit.bulkEditViews.bulkDurationDefaultText }}</span>`,
        },
      });
    }

    return new DurationComponent({ duration: this.model.get('duration') });
  },
  showState() {
    const stateComponent = this.getStateComponent();

    this.listenTo(stateComponent, 'change:state', state => {
      this.model.setState(state);
    });

    this.showChildView('state', stateComponent);
  },
  showOwner() {
    const ownerComponent = this.getOwnerComponent();

    this.listenTo(ownerComponent, 'change:owner', owner => {
      this.model.setOwner(owner);
    });

    this.showChildView('owner', ownerComponent);
  },
  showDueDateTime() {
    this.showDueDate();
    this.showDueTime();
  },
  showDueDate() {
    const dueDateComponent = this.getDueDateComponent();

    this.listenTo(dueDateComponent, 'change:due', date => {
      this.model.setDueDate(date);
    });

    this.showChildView('dueDate', dueDateComponent);
  },
  showDueTime() {
    const dueTimeComponent = this.getDueTimeComponent();

    this.listenTo(dueTimeComponent, 'change:time', time => {
      this.model.setDueTime(time);
    });

    this.showChildView('dueTime', dueTimeComponent);
  },
  showDuration() {
    const durationComponent = this.getDurationComponent();

    this.listenTo(durationComponent, 'change:duration', duration => {
      this.model.setDuration(duration);
    });

    this.showChildView('duration', durationComponent);
  },
});

const BulkEditFlowsBodyView = View.extend({
  modelEvents: {
    'change:stateMulti': 'showState',
    'change:ownerMulti': 'showOwner',
  },
  className: 'bulk-edit__body',
  template: BulkEditFlowBodyTemplate,
  regions: {
    state: '[data-state-region]',
    owner: '[data-owner-region]',
  },
  onRender() {
    this.showState();
    this.showOwner();
  },
  getStateComponent() {
    if (this.model.get('stateMulti')) {
      return new FlowsStateComponent({
        flows: this.collection,
        viewOptions: {
          className: 'button-secondary w-100',
          template: hbs`{{fas "dot-circle"}}<span class="action--gray">{{ @intl.patients.shared.bulkEdit.bulkEditViews.bulkStateDefaultText }}</span>`,
        },
      });
    }

    return new FlowsStateComponent({
      flows: this.collection,
      stateId: this.model.get('stateId'),
    });
  },
  getOwnerComponent() {
    const groups = this.model.getGroups();
    const infoText = groups.length ? null : i18n.bulkOwnerInfoText;

    if (this.model.get('ownerMulti')) {
      return new OwnerComponent({
        groups,
        viewOptions: {
          className: 'button-secondary w-100',
          template: hbs`{{far "user-circle"}}<span class="action--gray">{{ @intl.patients.shared.bulkEdit.bulkEditViews.bulkOwnerDefaultText }}</span>`,
        },
        infoText,
      });
    }

    return new OwnerComponent({
      owner: this.model.get('owner'),
      groups,
      infoText,
    });
  },
  showState() {
    const stateComponent = this.getStateComponent();

    this.listenTo(stateComponent, 'change:state', state => {
      this.model.setState(state);
    });

    this.showChildView('state', stateComponent);
  },
  showOwner() {
    const ownerComponent = this.getOwnerComponent();

    this.listenTo(ownerComponent, 'change:owner', owner => {
      this.model.setOwner(owner);
    });

    this.showChildView('owner', ownerComponent);
  },
});

const BulkEditFlowsSuccessTemplate = hbs`{{formatMessage  (intlGet "patients.shared.bulkEdit.bulkEditViews.bulkEditFlowsSuccess") itemCount=itemCount}}`;

const BulkEditActionsSuccessTemplate = hbs`{{formatMessage  (intlGet "patients.shared.bulkEdit.bulkEditViews.bulkEditActionsSuccess") itemCount=itemCount}}`;

const BulkDeleteFlowsSuccessTemplate = hbs`{{formatMessage  (intlGet "patients.shared.bulkEdit.bulkEditViews.bulkDeleteFlowsSuccess") itemCount=itemCount}}`;

const BulkDeleteActionsSuccessTemplate = hbs`{{formatMessage  (intlGet "patients.shared.bulkEdit.bulkEditViews.bulkDeleteActionsSuccess") itemCount=itemCount}}`;

export {
  BulkEditButtonView,
  BulkEditActionsHeaderView,
  BulkEditFlowsHeaderView,
  BulkEditActionsBodyView,
  BulkEditFlowsBodyView,
  BulkEditFlowsSuccessTemplate,
  BulkEditActionsSuccessTemplate,
  BulkDeleteFlowsSuccessTemplate,
  BulkDeleteActionsSuccessTemplate,
};