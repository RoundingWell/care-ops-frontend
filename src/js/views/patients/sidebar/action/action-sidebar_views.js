import _ from 'underscore';
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'sass/modules/buttons.scss';
import 'sass/modules/forms.scss';
import 'sass/modules/textarea-flex.scss';

import intl from 'js/i18n';

import { animSidebar } from 'js/anim';

import PreloadRegion from 'js/regions/preload_region';

import InputWatcherBehavior from 'js/behaviors/input-watcher';
import Optionlist from 'js/components/optionlist';

import { StateComponent, OwnerComponent, DueComponent, DurationComponent } from 'js/views/patients/actions/actions_views';

import ActionSidebarTemplate from './action-sidebar.hbs';
import ActionNameTemplate from './action-name.hbs';
import ActionDetailsTemplate from './action-details.hbs';

import './action-sidebar.scss';

const DisabledSaveView = View.extend({
  className: 'u-margin--t-8 u-text-align--right',
  template: hbs`<button class="button--green" disabled>{{ @intl.patients.sidebar.action.actionSidebarViews.disabledSaveView.saveBtn }}</button>`,
});

const SaveView = View.extend({
  className: 'u-margin--t-8 u-text-align--right',
  template: hbs`
    <button class="button--text u-margin--r-4 js-cancel">{{ @intl.patients.sidebar.action.actionSidebarViews.saveView.cancelBtn }}</button>
    <button class="button--green js-save">{{ @intl.patients.sidebar.action.actionSidebarViews.saveView.saveBtn }}</button>
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

const AttachmentView = View.extend({
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
  className: 'action-sidebar flex-region',
  template: ActionSidebarTemplate,
  regions: {
    name: '[data-name-region]',
    details: '[data-details-region]',
    state: '[data-state-region]',
    owner: '[data-owner-region]',
    due: '[data-due-region]',
    duration: '[data-duration-region]',
    attachment: '[data-attachment-region]',
    save: '[data-save-region]',
    activity: {
      el: '[data-activity-region]',
      regionClass: PreloadRegion,
    },
    timestamps: '[data-timestamps-region]',
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
      itemTemplate: hbs`<span class="action-sidebar__delete-icon">{{far "trash-alt"}}</span>{{ @intl.patients.sidebar.action.layoutView.menuOptions.delete }}`,
      lists: [{ collection: menuOptions }],
      align: 'right',
      popWidth: 248,
    });

    optionlist.show();
  },
  templateContext() {
    return {
      isNew: this.model.isNew(),
      hasForm: !!this.action.getForm(),
    };
  },
  initialize({ action }) {
    this.action = action;
    this.model = this.action.clone();
    this.listenTo(this.action, {
      'change:_state': this.onChangeActionState,
      'change:_role change:_clinician': this.onChangeOwner,
      'change:due_date': this.onChangeDueDate,
    });
    const flow = this.action.getFlow();
    this.listenTo(flow, 'change:_state', this.showAction);
  },
  _isDone(stateId) {
    const state = Radio.request('entities', 'states:model', stateId);
    return state.get('status') === 'done';
  },
  isFlowDone() {
    const flow = this.action.getFlow();
    return flow && flow.isDone();
  },
  onChangeActionState() {
    if (!this._isDone(this.action.get('_state')) && !this._isDone(this.action.previous('_state'))) return;

    this.showAction();
  },
  onChangeOwner() {
    this.showOwner();
  },
  onChangeDueDate() {
    this.showDue();
  },
  onAttach() {
    animSidebar(this.el);
  },
  onRender() {
    this.showAction();
  },
  showAction() {
    this.showForm();
    this.showState();
    this.showOwner();
    this.showDue();
    this.showDuration();
    this.showAttachment();
  },
  showForm() {
    this.stopListening(this.model);
    this.model = this.action.clone();
    this.listenTo(this.model, 'change:name change:details', this.showSave);

    if (this.model.isNew()) this.showDisabledSave();
    else this.getRegion('save').empty();

    this.showName();
    this.showDetails();
  },
  showName() {
    const isDisabled = this.action.isDone() || this.isFlowDone();
    this.showChildView('name', new NameView({ model: this.model, action: this.action, isDisabled }));
  },
  showDetails() {
    const isDisabled = this.action.isDone() || this.isFlowDone();
    this.showChildView('details', new DetailsView({ model: this.model, action: this.action, isDisabled }));
  },
  showState() {
    const isDisabled = this.action.isNew() || this.isFlowDone();
    const stateComponent = new StateComponent({ model: this.action, state: { isDisabled } });

    this.listenTo(stateComponent, 'change:state', state => {
      this.action.saveState(state);
    });

    this.showChildView('state', stateComponent);
  },
  showOwner() {
    const isDisabled = this.action.isNew() || this.action.isDone() || this.isFlowDone();
    const ownerComponent = new OwnerComponent({ model: this.action, state: { isDisabled } });

    this.listenTo(ownerComponent, 'change:owner', owner => {
      this.action.saveOwner(owner);
    });

    this.showChildView('owner', ownerComponent);
  },
  showDue() {
    const isDisabled = this.action.isNew() || this.action.isDone() || this.isFlowDone();
    const dueComponent = new DueComponent({ model: this.action, state: { isDisabled } });

    this.listenTo(dueComponent, 'change:due', date => {
      this.action.saveDue(date);
    });

    this.showChildView('due', dueComponent);
  },
  showDuration() {
    const isDisabled = this.action.isNew() || this.action.isDone() || this.isFlowDone();
    const durationComponent = new DurationComponent({ model: this.action, state: { isDisabled } });

    this.listenTo(durationComponent, 'change:duration', duration => {
      this.action.save({ duration });
    });

    this.showChildView('duration', durationComponent);
  },
  showAttachment() {
    const form = this.action.getForm();
    if (!form || this.action.isNew()) return;

    const attachmentView = new AttachmentView({ model: form });

    this.listenTo(attachmentView, 'click', () => {
      this.triggerMethod('click:form', form);
    });

    this.showChildView('attachment', attachmentView);
  },
  showSave() {
    if (!this.model.isValid()) return this.showDisabledSave();

    this.showChildView('save', new SaveView({ model: this.model }));
  },
  showDisabledSave() {
    this.showChildView('save', new DisabledSaveView());
  },
  onSave() {
    this.getRegion('save').empty();
  },
  onCancel() {
    if (this.model.isNew()) {
      this.triggerMethod('close', this);
      return;
    }

    this.showForm();
  },
});

export {
  LayoutView,
};
