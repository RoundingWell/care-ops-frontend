import _ from 'underscore';
import Backbone from 'backbone';
import hbs from 'handlebars-inline-precompile';
import Radio from 'backbone.radio';
import { View } from 'marionette';

import intl from 'js/i18n';

import Optionlist from 'js/components/optionlist';

import { StateComponent, OwnerComponent, DueComponent, TimeComponent, DurationComponent } from 'js/views/patients/shared/actions_views';

import BulkEditActionBodyTemplate from './bulk-edit-action-body.hbs';
import BulkEditFlowBodyTemplate from './bulk-edit-flow-body.hbs';

import './bulk-edit.scss';

const i18n = intl.patients.worklist.bulkEditViews;

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
    const flowsIncomplete = _.some(flows.invoke('isAllDone'), complete => !complete);

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
    <input type="checkbox" class="worklist-list__bulk-edit-select js-select" {{#if isAllSelected}}checked{{/if}} />
    <button class="button--blue js-bulk-edit">
      {{#if isFlowList}}
        {{formatMessage  (intlGet "patients.worklist.bulkEditViews.bulkEditButtonView.editFlows") itemCount=items.length}}
      {{else}}
        {{formatMessage  (intlGet "patients.worklist.bulkEditViews.bulkEditButtonView.editActions") itemCount=items.length}}
      {{/if}}
    </button>
    <span class="worklist-list__bulk-edit-cancel js-cancel">{{@intl.patients.worklist.bulkEditViews.bulkEditButtonView.cancel}}</span>
  `,
  templateContext() {
    return {
      isFlowList: this.getOption('isFlowType'),
      isAllSelected: this.getOption('isAllSelected'),
    };
  },
  triggers: {
    'click .js-select': {
      event: 'click:select',
      preventDefault: false,
    },
    'click .js-cancel': 'click:cancel',
    'click .js-bulk-edit': 'click:edit',
  },
});

const BulkEditActionsHeaderView = View.extend({
  template: hbs`
    <div class="flex">
      <div class="flex-grow">
      <h3 class="sidebar__heading">{{formatMessage  (intlGet "patients.worklist.bulkEditViews.bulkEditActionsHeaderView.headingText") itemCount=items.length}}</h3>
      </div>
      <div>
        <button class="button--icon u-margin--r-8 js-menu">{{far "ellipsis-h"}}</button>
        <button class="button--icon js-close">{{fas "times"}}</button>
      </div>
    </div>
  `,
  triggers: {
    'click .js-close': 'close',
    'click @ui.menu': 'click:menu',
  },
  ui: {
    menu: '.js-menu',
  },
  onClickMenu() {
    const itemCount = this.collection.length;
    const menuOptions = new Backbone.Collection([
      {
        onSelect: _.bind(this.triggerMethod, this, 'confirm:delete'),
      },
    ]);

    const optionlist = new Optionlist({
      ui: this.ui.menu,
      uiView: this,
      headingText: i18n.bulkEditActionsHeaderView.menuOptions.headingText,
      itemTemplate: hbs`<span class="sidebar__delete-icon">{{far "trash-alt"}}</span>{{formatMessage  (intlGet "patients.worklist.bulkEditViews.bulkEditActionsHeaderView.menuOptions.delete") itemCount=itemCount}}`,
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
        <h3 class="sidebar__heading">{{formatMessage  (intlGet "patients.worklist.bulkEditViews.bulkEditFlowsHeaderView.headingText") itemCount=items.length}}</h3>
      </div>
      <div>
        <button class="button--icon u-margin--r-8 js-menu">{{far "ellipsis-h"}}</button>
        <button class="button--icon js-close">{{fas "times"}}</button>
      </div>
    </div>
  `,
  triggers: {
    'click .js-close': 'close',
    'click @ui.menu': 'click:menu',
  },
  ui: {
    menu: '.js-menu',
  },
  onClickMenu() {
    const itemCount = this.collection.length;
    const menuOptions = new Backbone.Collection([
      {
        onSelect: _.bind(this.triggerMethod, this, 'confirm:delete'),
      },
    ]);

    const optionlist = new Optionlist({
      ui: this.ui.menu,
      uiView: this,
      headingText: i18n.bulkEditFlowsHeaderView.menuOptions.headingText,
      itemTemplate: hbs`<span class="sidebar__delete-icon">{{far "trash-alt"}}</span>{{formatMessage  (intlGet "patients.worklist.bulkEditViews.bulkEditFlowsHeaderView.menuOptions.delete") itemCount=itemCount}}`,
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
    'change:dateMulti': 'showDueDate',
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
    this.showDueDate();
    this.showDueTime();
    this.showDuration();
  },
  getStateComponent() {
    if (this.model.get('stateMulti')) {
      return new StateComponent({
        viewOptions: {
          className: 'button-secondary w-100',
          template: hbs`{{fas "dot-circle"}}<span class="action--gray">{{ @intl.patients.worklist.bulkEditViews.bulkStateDefaultText }}</span>`,
        },
      });
    }

    return new StateComponent({ stateId: this.model.get('stateId') });
  },
  getOwnerComponent() {
    const groups = this.model.getGroups();

    if (this.model.get('ownerMulti')) {
      return new OwnerComponent({
        groups,
        viewOptions: {
          className: 'button-secondary w-100',
          template: hbs`{{far "user-circle"}}<span class="action--gray">{{ @intl.patients.worklist.bulkEditViews.bulkOwnerDefaultText }}</span>`,
        },
      });
    }

    return new OwnerComponent({
      owner: this.model.get('owner'),
      groups,
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
          template: hbs`{{far "calendar-alt"}}<span class="action--gray">{{ @intl.patients.worklist.bulkEditViews.bulkDueDateDefaultText }}</span>`,
        },
      });
    }

    return new DueComponent({ date: this.model.get('date') });
  },
  getDueTimeComponent() {
    if (this.model.get('timeMulti')) {
      return new TimeComponent({
        viewOptions: {
          className: 'button-secondary time-component w-100',
          template: hbs`{{far "clock"}} <span class="action--gray">{{ @intl.patients.worklist.bulkEditViews.bulkDueTimeDefaultText }}</span>`,
        },
      });
    }

    return new TimeComponent({ time: this.model.get('time') });
  },
  getDurationComponent() {
    if (this.model.get('durationMulti')) {
      return new DurationComponent({
        viewOptions: {
          className: 'button-secondary w-100',
          template: hbs`{{far "stopwatch"}}<span class="action--gray">{{ @intl.patients.worklist.bulkEditViews.bulkDurationDefaultText }}</span>`,
        },
      });
    }

    return new DurationComponent({ duration: this.model.get('duration') });
  },
  showState() {
    const stateComponent = this.getStateComponent();

    this.listenTo(stateComponent, 'change:state', state => {
      this.model.set({ stateId: state.id, stateMulti: false });
    });

    this.showChildView('state', stateComponent);
  },
  showOwner() {
    const ownerComponent = this.getOwnerComponent();

    this.listenTo(ownerComponent, 'change:owner', owner => {
      this.model.set({ owner, ownerMulti: false });
    });

    this.showChildView('owner', ownerComponent);
  },
  showDueDate() {
    const dueDateComponent = this.getDueDateComponent();

    this.listenTo(dueDateComponent, 'change:due', date => {
      this.model.set({ date, dateMulti: false });
    });

    this.showChildView('dueDate', dueDateComponent);
  },
  showDueTime() {
    const dueTimeComponent = this.getDueTimeComponent();

    this.listenTo(dueTimeComponent, 'change:time', time => {
      this.model.set({ time, timeMulti: false });
    });

    this.showChildView('dueTime', dueTimeComponent);
  },
  showDuration() {
    const durationComponent = this.getDurationComponent();

    this.listenTo(durationComponent, 'change:duration', duration => {
      this.model.set({ duration, durationMulti: false });
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
          template: hbs`{{fas "dot-circle"}}<span class="action--gray">{{ @intl.patients.worklist.bulkEditViews.bulkStateDefaultText }}</span>`,
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

    if (this.model.get('ownerMulti')) {
      return new OwnerComponent({
        groups,
        viewOptions: {
          className: 'button-secondary w-100',
          template: hbs`{{far "user-circle"}}<span class="action--gray">{{ @intl.patients.worklist.bulkEditViews.bulkOwnerDefaultText }}</span>`,
        },
      });
    }

    return new OwnerComponent({
      owner: this.model.get('owner'),
      groups,
    });
  },
  showState() {
    const stateComponent = this.getStateComponent();

    this.listenTo(stateComponent, 'change:state', state => {
      this.model.set({ stateId: state.id, stateMulti: false });
    });

    this.showChildView('state', stateComponent);
  },
  showOwner() {
    const ownerComponent = this.getOwnerComponent();

    this.listenTo(ownerComponent, 'change:owner', owner => {
      this.model.set({ owner, ownerMulti: false });
    });

    this.showChildView('owner', ownerComponent);
  },
});

const BulkEditFlowsSuccessTemplate = hbs`{{formatMessage  (intlGet "patients.worklist.bulkEditViews.bulkEditFlowsSuccess") itemCount=itemCount}}`;

const BulkEditActionsSuccessTemplate = hbs`{{formatMessage  (intlGet "patients.worklist.bulkEditViews.bulkEditActionsSuccess") itemCount=itemCount}}`;

const BulkDeleteFlowsSuccessTemplate = hbs`{{formatMessage  (intlGet "patients.worklist.bulkEditViews.bulkDeleteFlowsSuccess") itemCount=itemCount}}`;

const BulkDeleteActionsSuccessTemplate = hbs`{{formatMessage  (intlGet "patients.worklist.bulkEditViews.bulkDeleteActionsSuccess") itemCount=itemCount}}`;

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
