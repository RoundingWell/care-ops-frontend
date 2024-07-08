import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import trim from 'js/utils/formatting/trim';

import InputWatcherBehavior from 'js/behaviors/input-watcher';

import 'scss/modules/buttons.scss';
import 'scss/modules/textarea-flex.scss';
import 'scss/modules/sidebar.scss';

import { StateComponent, OwnerComponent, DueComponent, TimeComponent, DurationComponent } from 'js/views/patients/shared/actions_views';
import { ReadOnlyStateView, ReadOnlyOwnerView, ReadOnlyDueDateTimeView, ReadOnlyDurationView } from 'js/views/patients/shared/read-only_views';

import ActionDetailsTemplate from './action-details.hbs';

import './action-sidebar.scss';

const SaveView = View.extend({
  className: 'u-margin--t-8 sidebar__save',
  template: hbs`
    <button class="button--green js-save">{{ @intl.patients.sidebar.action.actionSidebarActionViews.saveView.saveBtn }}</button>
    <button class="button--text u-margin--r-4 js-cancel">{{ @intl.patients.sidebar.action.actionSidebarActionViews.saveView.cancelBtn }}</button>
  `,
  triggers: {
    'click .js-cancel': 'cancel',
    'click .js-save': 'save',
  },
});

const DetailsView = View.extend({
  className: 'pos--relative',
  template: ActionDetailsTemplate,
  behaviors: [InputWatcherBehavior],
  ui: {
    input: '.js-input',
    spacer: '.js-spacer',
  },
  onWatchChange(text) {
    this.ui.input.val(text);
    this.ui.spacer.text(text || ' ');

    this.model.set('details', trim(text));
  },
});

const ReadOnlyActionView = View.extend({
  template: hbs`
    <div class="pos--relative">
      <div class="action-sidebar__name">{{ name }}</div>
    </div>
    <div class="u-margin--t-8">
    {{ details }}{{#unless details}}<span class="sidebar--no-results">{{ @intl.patients.sidebar.action.actionSidebarActionViews.readOnlyActionView.noDetails }}</span>{{/unless}}
    </div>
    <div class="flex u-margin--t-16"><h4 class="sidebar__label u-margin--t-8">{{ @intl.patients.sidebar.action.actionSidebarActionViews.readOnlyActionView.stateLabel }}</h4><div class="flex-grow" data-state-region></div></div>
    <div class="flex u-margin--t-8"><h4 class="sidebar__label u-margin--t-8">{{ @intl.patients.sidebar.action.actionSidebarActionViews.readOnlyActionView.ownerLabel }}</h4><div class="flex-grow" data-owner-region></div></div>
    <div class="flex u-margin--t-8"><h4 class="sidebar__label u-margin--t-8">{{ @intl.patients.sidebar.action.actionSidebarActionViews.readOnlyActionView.dueDayLabel }}</h4><div class="flex flex-grow" data-due-datetime-region></div></div>
    <div class="flex u-margin--t-8"><h4 class="sidebar__label u-margin--t-8">{{ @intl.patients.sidebar.action.actionSidebarActionViews.readOnlyActionView.durationLabel }}</h4><div class="flex-grow" data-duration-region></div></div>
    {{#unless canEdit}}
    <div class="flex u-margin--t-8">
      <h4 class="sidebar__label u-margin--t-8">{{ @intl.patients.sidebar.action.actionSidebarActionViews.readOnlyActionView.permissionLabel }}</h4>
      <div class="flex flex--grow action-sidebar__info">
        {{far "ban"}}<span class="u-margin--l-8">{{ @intl.patients.sidebar.action.actionSidebarActionViews.readOnlyActionView.permissionInfo }}</span>
      </div>
    </div>
    {{/unless}}
  `,
  regions: {
    state: '[data-state-region]',
    owner: '[data-owner-region]',
    dueDateTime: '[data-due-datetime-region]',
    duration: '[data-duration-region]',
  },
  onRender() {
    this.showState();
    this.showOwner();
    this.showDueDateTime();
    this.showDuration();
  },
  showState() {
    const readOnlyStateView = new ReadOnlyStateView({ model: this.model });
    this.showChildView('state', readOnlyStateView);
  },
  showOwner() {
    const readOnlyOwnerView = new ReadOnlyOwnerView({ model: this.model });
    this.showChildView('owner', readOnlyOwnerView);
  },
  showDueDateTime() {
    const readOnlyDueDateTimeView = new ReadOnlyDueDateTimeView({ model: this.model });
    this.showChildView('dueDateTime', readOnlyDueDateTimeView);
  },
  showDuration() {
    const readOnlyDurationView = new ReadOnlyDurationView({ model: this.model });
    this.showChildView('duration', readOnlyDurationView);
  },
  templateContext() {
    return {
      canEdit: this.model.canEdit(),
    };
  },
});

const ActionView = View.extend({
  childViewTriggers: {
    'save': 'save',
    'cancel': 'cancel',
  },
  template: hbs`
    <div class="action-sidebar__name">{{ name }}</div>
    <div class="u-margin--t-8" data-details-region></div>
    <div data-save-region></div>
    <div class="flex u-margin--t-16"><h4 class="sidebar__label u-margin--t-8">{{ @intl.patients.sidebar.action.actionSidebarActionViews.actionView.stateLabel }}</h4><div class="flex-grow" data-state-region></div></div>
    <div class="flex u-margin--t-8"><h4 class="sidebar__label u-margin--t-8">{{ @intl.patients.sidebar.action.actionSidebarActionViews.actionView.ownerLabel }}</h4><div class="flex-grow" data-owner-region></div></div>
    <div class="flex u-margin--t-8"><h4 class="sidebar__label u-margin--t-8">{{ @intl.patients.sidebar.action.actionSidebarActionViews.actionView.dueDayLabel }}</h4>
      <div class="flex flex-grow">{{~ remove_whitespace ~}}
        <div class="flex-grow" data-due-date-region></div>{{~ remove_whitespace ~}}
        <div class="flex-grow" data-due-time-region></div>{{~ remove_whitespace ~}}
      </div>
    </div>
    <div class="flex u-margin--t-8"><h4 class="sidebar__label u-margin--t-8">{{ @intl.patients.sidebar.action.actionSidebarActionViews.actionView.durationLabel }}</h4><div class="flex-grow" data-duration-region></div></div>
  `,
  regions: {
    name: '[data-name-region]',
    details: '[data-details-region]',
    save: '[data-save-region]',
    state: '[data-state-region]',
    owner: '[data-owner-region]',
    dueDate: '[data-due-date-region]',
    dueTime: '[data-due-time-region]',
    duration: '[data-duration-region]',
  },
  modelEvents: {
    'change:_state': 'onChangeActionState',
    'change:_owner': 'onChangeOwner',
    'change:due_date': 'onChangeDue',
    'change:due_time': 'onChangeDue',
    'change:duration': 'onChangeDuration',
  },
  onChangeActionState() {
    const isDone = this.model.isDone();

    const prevState = this.model.getPreviousState();
    const isPrevDone = prevState.isDone();

    if (isDone === isPrevDone) {
      this.showState();
      return;
    }

    this.render();
  },
  onChangeOwner() {
    if (!this.isRendered()) return;
    this.showOwner();
  },
  onChangeDue() {
    this.showDueDate();
    this.showDueTime();
  },
  onChangeDuration() {
    this.showDuration();
  },
  cloneAction() {
    // NOTE: creates a new clone from the truth for cancelable editing
    if (this.clonedAction) this.stopListening(this.clonedAction);
    this.clonedAction = this.model.clone();
  },
  onRender() {
    this.showEditForm();
    this.showState();
    this.showOwner();
    this.showDueDate();
    this.showDueTime();
    this.showDuration();
  },
  showSave() {
    this.showChildView('save', new SaveView({ model: this.clonedAction }));
  },
  onSave() {
    this.getRegion('save').empty();
  },
  onCancel() {
    this.showEditForm();
  },
  showEditForm() {
    this.cloneAction();
    this.listenTo(this.clonedAction, 'change:details', this.showSave);

    this.getRegion('save').empty();

    this.showDetails();
  },
  showDetails() {
    this.showChildView('details', new DetailsView({ model: this.clonedAction }));
  },
  showState() {
    const stateComponent = new StateComponent({ stateId: this.model.get('_state') });

    this.listenTo(stateComponent, 'change:state', state => {
      this.model.saveState(state);
    });

    this.showChildView('state', stateComponent);
  },
  showOwner() {
    const isDisabled = this.model.isDone();
    const program = this.model.getProgram();
    const ownerComponent = new OwnerComponent({
      owner: this.model.getOwner(),
      workspaces: program.getUserWorkspaces(),
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
      isOverdue: this.model.isOverdue(),
      state: { isDisabled },
    });

    this.listenTo(dueTimeComponent, 'change:time', time => {
      this.model.saveDueTime(time);
    });

    this.showChildView('dueTime', dueTimeComponent);
  },
  showDuration() {
    const isDisabled = this.model.isDone();
    const durationComponent = new DurationComponent({ duration: this.model.get('duration'), state: { isDisabled } });

    this.listenTo(durationComponent, 'change:duration', duration => {
      this.model.save({ duration });
    });

    this.showChildView('duration', durationComponent);
  },
});

export {
  ReadOnlyActionView,
  ActionView,
};
