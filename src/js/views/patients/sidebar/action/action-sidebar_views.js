import _ from 'underscore';
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'sass/modules/buttons.scss';
import 'sass/modules/forms.scss';
import 'sass/modules/textarea-flex.scss';
import 'sass/modules/sidebar.scss';

import intl from 'js/i18n';

import { animSidebar } from 'js/anim';

import PreloadRegion from 'js/regions/preload_region';

import InputWatcherBehavior from 'js/behaviors/input-watcher';
import Optionlist from 'js/components/optionlist';

import { StateComponent, OwnerComponent, DueComponent, TimeComponent, DurationComponent } from 'js/views/patients/shared/actions_views';

import ActionSidebarTemplate from './action-sidebar.hbs';
import ActionNameTemplate from './action-name.hbs';
import ActionDetailsTemplate from './action-details.hbs';

import './action-sidebar.scss';

const DisabledSaveView = View.extend({
  className: 'u-margin--t-8 sidebar__save',
  template: hbs`<button class="button--green" disabled>{{ @intl.patients.sidebar.action.actionSidebarViews.disabledSaveView.saveBtn }}</button>`,
});

const SaveView = View.extend({
  className: 'u-margin--t-8 sidebar__save',
  template: hbs`
    <button class="button--green js-save">{{ @intl.patients.sidebar.action.actionSidebarViews.saveView.saveBtn }}</button>
    <button class="button--text u-margin--r-4 js-cancel">{{ @intl.patients.sidebar.action.actionSidebarViews.saveView.cancelBtn }}</button>
  `,
  triggers: {
    'click .js-cancel': 'cancel',
    'click .js-save': 'save',
  },
});

const NameView = View.extend({
  className: 'pos--relative',
  template: ActionNameTemplate,
  behaviors: [InputWatcherBehavior],
  ui: {
    input: '.js-input',
    spacer: '.js-spacer',
  },
  onWatchKeydown(evt) {
    if (evt.which === _.ENTER_KEY) {
      evt.preventDefault();
      return;
    }
  },
  onWatchChange(text) {
    const newText = _.removeNewline(text);
    this.ui.input.val(newText);
    this.ui.spacer.text(newText || ' ');

    this.model.set('name', newText);
  },
  templateContext() {
    return {
      isNew: this.model.isNew(),
      isDisabled: this.getOption('isDisabled'),
    };
  },
  onDomRefresh() {
    if (this.model.isNew()) {
      this.ui.input.focus();
    }
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

    this.model.set('details', _.trim(text));
  },
  templateContext() {
    return {
      isDisabled: this.getOption('isDisabled'),
    };
  },
});

const FormView = View.extend({
  attributes() {
    return {
      disabled: !!this.getOption('isShowingForm'),
    };
  },
  tagName: 'button',
  className: 'button-secondary w-100 action-sidebar__form',
  template: hbs`{{far "poll-h"}}{{ name }}`,
  triggers: {
    'click': 'click',
  },
});

const LayoutView = View.extend({
  childViewTriggers: {
    'save': 'save',
    'cancel': 'cancel',
  },
  className: 'sidebar flex-region',
  template: ActionSidebarTemplate,
  regions: {
    name: '[data-name-region]',
    details: '[data-details-region]',
    state: '[data-state-region]',
    owner: '[data-owner-region]',
    dueDay: '[data-due-day-region]',
    dueTime: '[data-due-time-region]',
    duration: '[data-duration-region]',
    form: '[data-form-region]',
    save: '[data-save-region]',
    activity: {
      el: '[data-activity-region]',
      regionClass: PreloadRegion,
    },
    timestamps: '[data-timestamps-region]',
    comment: '[data-comment-region]',
  },
  triggers: {
    'click .js-close': 'close',
    'click @ui.menu': 'click:menu',
  },
  ui: {
    menu: '.js-menu',
  },
  onClickMenu() {
    const menuOptions = new Backbone.Collection([
      {
        onSelect: _.bind(this.triggerMethod, this, 'delete'),
      },
    ]);

    const optionlist = new Optionlist({
      ui: this.ui.menu,
      uiView: this,
      headingText: intl.patients.sidebar.action.layoutView.menuOptions.headingText,
      itemTemplate: hbs`<span class="sidebar__delete-icon">{{far "trash-alt"}}</span>{{ @intl.patients.sidebar.action.layoutView.menuOptions.delete }}`,
      lists: [{ collection: menuOptions }],
      align: 'right',
      popWidth: 248,
    });

    optionlist.show();
  },
  templateContext() {
    return {
      isNew: this.action.isNew(),
      hasForm: !!this.action.getForm(),
    };
  },
  initialize({ action }) {
    this.action = action;
    this.listenTo(this.action, {
      'change:_state': this.onChangeActionState,
      'change:_owner': this.onChangeOwner,
      'change:due_date': this.onChangeDueDate,
      'change:due_time': this.onChangeDueDate,
    });
    const flow = this.action.getFlow();
    this.listenTo(flow, 'change:_state', this.showAction);
  },
  isFlowDone() {
    const flow = this.action.getFlow();
    return flow && flow.isDone();
  },
  onChangeActionState() {
    const isDone = this.action.isDone();

    const prevState = Radio.request('entities', 'states:model', this.action.previous('_state'));
    const isPrevDone = prevState.get('status') === 'done';

    if (!isDone && !isPrevDone) return;

    this.showAction();
  },
  onChangeOwner() {
    this.showOwner();
  },
  onChangeDueDate() {
    this.showDueDay();
    this.showDueTime();
  },
  onAttach() {
    animSidebar(this.el);
  },
  onRender() {
    this.showAction();
  },
  cloneAction() {
    // NOTE: creates a new clone from the truth for cancelable editing
    if (this.clonedAction) this.stopListening(this.clonedAction);
    this.clonedAction = this.action.clone();
  },
  showAction() {
    this.showEditForm();
    this.showState();
    this.showOwner();
    this.showDueDay();
    this.showDueTime();
    this.showDuration();
    this.showForm();
  },
  showEditForm() {
    this.cloneAction();
    this.listenTo(this.clonedAction, 'change:name change:details', this.showSave);

    if (this.action.isNew()) this.showDisabledSave();
    else this.getRegion('save').empty();

    this.showName();
    this.showDetails();
  },
  showName() {
    const isDisabled = this.action.isDone() || this.isFlowDone();
    this.showChildView('name', new NameView({ model: this.clonedAction, action: this.action, isDisabled }));
  },
  showDetails() {
    const isDisabled = this.action.isDone() || this.isFlowDone();
    this.showChildView('details', new DetailsView({ model: this.clonedAction, action: this.action, isDisabled }));
  },
  showState() {
    const isDisabled = this.action.isNew() || this.isFlowDone();
    const stateComponent = new StateComponent({ stateId: this.action.get('_state'), state: { isDisabled } });

    this.listenTo(stateComponent, 'change:state', state => {
      this.action.saveState(state);
    });

    this.showChildView('state', stateComponent);
  },
  showOwner() {
    const isDisabled = this.action.isNew() || this.action.isDone() || this.isFlowDone();
    const ownerComponent = new OwnerComponent({
      owner: this.action.getOwner(),
      groups: this.action.getPatient().getGroups(),
      state: { isDisabled },
    });

    this.listenTo(ownerComponent, 'change:owner', owner => {
      this.action.saveOwner(owner);
    });

    this.showChildView('owner', ownerComponent);
  },
  showDueDay() {
    const isDisabled = this.action.isNew() || this.action.isDone() || this.isFlowDone();
    const dueDayComponent = new DueComponent({ date: this.action.get('due_date'), state: { isDisabled } });

    this.listenTo(dueDayComponent, 'change:due', date => {
      this.action.saveDueDate(date);
    });

    this.showChildView('dueDay', dueDayComponent);
  },
  showDueTime() {
    const isDisabled = this.action.isNew() || this.action.isDone() || this.isFlowDone() || !this.action.get('due_date');
    const dueTimeComponent = new TimeComponent({ time: this.action.get('due_time'), state: { isDisabled } });

    this.listenTo(dueTimeComponent, 'change:time', time => {
      this.action.saveDueTime(time);
    });

    this.showChildView('dueTime', dueTimeComponent);
  },
  showDuration() {
    const isDisabled = this.action.isNew() || this.action.isDone() || this.isFlowDone();
    const durationComponent = new DurationComponent({ duration: this.action.get('duration'), state: { isDisabled } });

    this.listenTo(durationComponent, 'change:duration', duration => {
      this.action.save({ duration });
    });

    this.showChildView('duration', durationComponent);
  },
  showForm() {
    const form = this.action.getForm();
    if (!form || this.action.isNew()) return;

    const formView = new FormView({
      model: form,
      isShowingForm: this.getOption('isShowingForm'),
    });

    this.listenTo(formView, 'click', () => {
      this.triggerMethod('click:form', form);
    });

    this.showChildView('form', formView);
  },
  showSave() {
    if (!this.clonedAction.isValid()) return this.showDisabledSave();

    this.showChildView('save', new SaveView({ model: this.clonedAction }));
  },
  showDisabledSave() {
    this.showChildView('save', new DisabledSaveView());
  },
  onSave() {
    this.getRegion('save').empty();
  },
  onCancel() {
    if (this.action.isNew()) {
      this.triggerMethod('close', this);
      return;
    }

    this.showEditForm();
  },
});

export {
  LayoutView,
};
