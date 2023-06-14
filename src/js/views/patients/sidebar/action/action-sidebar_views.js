import { bind } from 'underscore';
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'scss/modules/buttons.scss';
import 'scss/modules/forms.scss';
import 'scss/modules/textarea-flex.scss';
import 'scss/modules/sidebar.scss';

import { ACTION_SHARING } from 'js/static';
import intl from 'js/i18n';
import keyCodes from 'js/utils/formatting/key-codes';
import removeNewline from 'js/utils/formatting/remove-newline';
import trim from 'js/utils/formatting/trim';

import { animSidebar } from 'js/anim';

import PreloadRegion from 'js/regions/preload_region';

import InputWatcherBehavior from 'js/behaviors/input-watcher';
import Optionlist from 'js/components/optionlist';

import { StateComponent, OwnerComponent, DueComponent, TimeComponent, DurationComponent } from 'js/views/patients/shared/actions_views';
import { ReadOnlyDetailsView, ReadOnlyStateView, ReadOnlyOwnerView, ReadOnlyDueDateTimeView, ReadOnlyDurationView } from 'js/views/patients/shared/read-only_views';


import ActionSidebarTemplate from './action-sidebar.hbs';
import ActionNameTemplate from './action-name.hbs';
import ActionDetailsTemplate from './action-details.hbs';
import FormSharingTemplate from './form-sharing.hbs';

import 'scss/domain/action-state.scss';
import './action-sidebar.scss';

const { ENTER_KEY } = keyCodes;

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
    if (evt.which === ENTER_KEY) {
      evt.preventDefault();
      return;
    }
  },
  onWatchChange(text) {
    const newText = removeNewline(text);
    this.ui.input.val(newText);
    this.ui.spacer.text(newText || ' ');

    this.model.set('name', newText);
  },
  templateContext() {
    return {
      isNew: this.model.isNew(),
      isDisabled: this.getOption('isDisabled'),
      isReadOnly: !this.model.isAdHoc() || !this.model.canEdit(),
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

    this.model.set('details', trim(text));
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
  template: hbs`{{far "square-poll-horizontal"}}<span>{{ name }}</span>`,
  triggers: {
    'click': 'click',
  },
});

function getSharingOpts(sharing) {
  switch (sharing) {
    case ACTION_SHARING.PENDING:
    case ACTION_SHARING.SENT:
      return {
        iconType: 'fas',
        icon: 'circle-dot',
        color: 'black',
      };
    case ACTION_SHARING.RESPONDED:
      return {
        iconType: 'fas',
        icon: 'circle-check',
        color: 'green',
      };
    case ACTION_SHARING.CANCELED:
    case ACTION_SHARING.ERROR_OPT_OUT:
      return {
        iconType: 'far',
        icon: 'octagon-minus',
        color: 'orange',
      };
    default:
      return {
        iconType: 'fas',
        icon: 'circle-exclamation',
        color: 'red',
      };
  }
}

const FormSharingView = View.extend({
  className: 'sidebar__dialog',
  triggers: {
    'click .js-share': 'click:share',
    'click .js-cancel': 'click:cancelShare',
    'click .js-undo-cancel': 'click:undoCancelShare',
    'click .js-response': 'click:response',
  },
  template: FormSharingTemplate,
  templateContext() {
    const patient = this.model.getPatient();
    const sharing = this.model.get('sharing');
    const stateOptions = getSharingOpts(sharing);
    const isPending = sharing === ACTION_SHARING.PENDING;
    const isSent = sharing === ACTION_SHARING.SENT;
    const isResponded = sharing === ACTION_SHARING.RESPONDED;
    const isCanceled = sharing === ACTION_SHARING.CANCELED;

    return {
      stateOptions,
      isWaiting: isSent || isPending,
      isResponded,
      isCanceled,
      isError: !isPending && !isSent && !isResponded && !isCanceled,
      patient: patient.pick('first_name', 'last_name'),
      isDone: this.model.isDone(),
    };
  },
});

const MenuView = View.extend({
  tagName: 'button',
  className: 'button--icon',
  template: hbs`{{far "ellipsis"}}`,
  triggers: {
    'click': 'click',
  },
});

const PermissionsView = View.extend({
  className: 'flex u-margin--t-8',
  template: hbs`
    <h4 class="sidebar__label u-margin--t-8">{{ @intl.patients.sidebar.action.actionSidebarViews.permissionsView.label }}</h4>
    <div class="flex flex--grow action-sidebar__info">
      {{far "ban"}}<span class="u-margin--l-8">{{ @intl.patients.sidebar.action.actionSidebarViews.permissionsView.info }}</span>
    </div>
  `,
});

const LayoutView = View.extend({
  childViewTriggers: {
    'save': 'save',
    'cancel': 'cancel',
    'click:share': 'click:share',
    'click:cancelShare': 'click:cancelShare',
    'click:undoCancelShare': 'click:undoCancelShare',
  },
  className: 'sidebar flex-region',
  template: ActionSidebarTemplate,
  regions: {
    menu: '[data-menu-region]',
    name: '[data-name-region]',
    details: '[data-details-region]',
    state: '[data-state-region]',
    owner: '[data-owner-region]',
    dueDate: '[data-due-date-region]',
    dueTime: '[data-due-time-region]',
    dueDateTime: '[data-due-datetime-region]',
    duration: '[data-duration-region]',
    form: '[data-form-region]',
    permissions: {
      el: '[data-permissions-region]',
      replaceElement: true,
    },
    formSharing: '[data-form-sharing-region]',
    save: '[data-save-region]',
    activity: {
      el: '[data-activity-region]',
      regionClass: PreloadRegion,
    },
    attachments: '[data-attachments-region]',
    timestamps: '[data-timestamps-region]',
    comment: '[data-comment-region]',
  },
  triggers: {
    'click .js-close': 'close',
  },
  templateContext() {
    const outreach = this.action.get('outreach');
    return {
      outreach,
      hasOutreach: !!outreach,
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
      'change:duration': this.onChangeDuration,
      'change:sharing': this.onChangeSharing,
    });
    const flow = this.action.getFlow();
    this.listenTo(flow, 'change:_state', this.showActions);
  },
  isFlowDone() {
    const flow = this.action.getFlow();
    return flow && flow.isDone();
  },
  onChangeActionState() {
    this.showFormSharing();
    const isDone = this.action.isDone();

    const prevState = Radio.request('entities', 'states:model', this.action.previous('_state'));
    const isPrevDone = prevState.isDone();

    if (isDone === isPrevDone) return;

    this.showActions();
  },
  onChangeOwner() {
    const canEdit = this.action.canEdit();
    if (canEdit !== this.canEdit) {
      this.render();
      return;
    }
    this.showOwner();
  },
  onChangeDueDate() {
    this.showDueDate();
    this.showDueTime();
  },
  onChangeDuration() {
    this.showDuration();
  },
  onChangeSharing() {
    this.showFormSharing();
  },
  onAttach() {
    animSidebar(this.el);
  },
  onRender() {
    this.showActions();

    this.showForm();
    this.showFormSharing();
  },
  cloneAction() {
    // NOTE: creates a new clone from the truth for cancelable editing
    if (this.clonedAction) this.stopListening(this.clonedAction);
    this.clonedAction = this.action.clone();
  },
  showActions() {
    this.canEdit = !this.isFlowDone() && this.action.canEdit();

    this.showMenu();
    this.showEditForm();
    this.showState();
    this.showOwner();
    this.showDueDate();
    this.showDueTime();
    this.showDuration();
    this.showPermissions();
  },
  showMenu() {
    if (!this.canEdit) {
      this.getRegion('menu').empty();
      return;
    }

    const menuView = new MenuView();

    this.listenTo(menuView, 'click', this.onClickMenu);

    this.showChildView('menu', menuView);
  },
  onClickMenu(view) {
    const menuOptions = new Backbone.Collection([
      {
        onSelect: bind(this.triggerMethod, this, 'delete'),
      },
    ]);

    const optionlist = new Optionlist({
      ui: view.$el,
      uiView: this,
      headingText: intl.patients.sidebar.action.actionSidebarViews.layoutView.menuOptions.headingText,
      itemTemplate: hbs`{{far "trash-can" classes="sidebar__delete-icon"}}<span>{{ @intl.patients.sidebar.action.actionSidebarViews.layoutView.menuOptions.delete }}</span>`,
      lists: [{ collection: menuOptions }],
      align: 'right',
      popWidth: 248,
    });

    optionlist.show();
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
    const isDisabled = this.action.isDone() || !this.canEdit;
    this.showChildView('name', new NameView({ model: this.clonedAction, isDisabled }));
  },
  showDetails() {
    if (!this.canEdit) {
      const readOnlyDetailsView = new ReadOnlyDetailsView({ model: this.action });
      this.showChildView('details', readOnlyDetailsView);
      return;
    }
    this.showChildView('details', new DetailsView({ model: this.clonedAction }));
  },
  showState() {
    if (!this.canEdit) {
      const readOnlyStateView = new ReadOnlyStateView({ model: this.action });
      this.showChildView('state', readOnlyStateView);
      return;
    }

    const isDisabled = this.action.isNew();
    const stateComponent = new StateComponent({ stateId: this.action.get('_state'), state: { isDisabled } });

    this.listenTo(stateComponent, 'change:state', state => {
      this.action.saveState(state);
    });

    this.showChildView('state', stateComponent);
  },
  showOwner() {
    if (!this.canEdit) {
      const readOnlyOwnerView = new ReadOnlyOwnerView({ model: this.action });
      this.showChildView('owner', readOnlyOwnerView);
      return;
    }

    const isDisabled = this.action.isNew() || this.action.isDone();
    const ownerComponent = new OwnerComponent({
      owner: this.action.getOwner(),
      state: { isDisabled },
    });

    this.listenTo(ownerComponent, 'change:owner', owner => {
      this.action.saveOwner(owner);
    });

    this.showChildView('owner', ownerComponent);
  },
  showDueDate() {
    if (!this.canEdit) {
      const readOnlyDueDateTimeView = new ReadOnlyDueDateTimeView({ model: this.action });
      this.showChildView('dueDateTime', readOnlyDueDateTimeView);
      return;
    }

    const isDisabled = this.action.isNew() || this.action.isDone();
    const dueDateComponent = new DueComponent({
      date: this.action.get('due_date'),
      state: { isDisabled },
      isOverdue: this.action.isOverdue(),
    });

    this.listenTo(dueDateComponent, 'change:due', date => {
      this.action.saveDueDate(date);
    });

    this.showChildView('dueDate', dueDateComponent);
  },
  showDueTime() {
    if (!this.canEdit) return;

    const isDisabled = this.action.isNew() || this.action.isDone() || !this.action.get('due_date');
    const dueTimeComponent = new TimeComponent({
      time: this.action.get('due_time'),
      isOverdue: this.action.isOverdue(),
      state: { isDisabled },
    });

    this.listenTo(dueTimeComponent, 'change:time', time => {
      this.action.saveDueTime(time);
    });

    this.showChildView('dueTime', dueTimeComponent);
  },
  showDuration() {
    if (!this.canEdit) {
      const readOnlyDurationView = new ReadOnlyDurationView({ model: this.action });
      this.showChildView('duration', readOnlyDurationView);
      return;
    }

    const isDisabled = this.action.isNew() || this.action.isDone();
    const durationComponent = new DurationComponent({ duration: this.action.get('duration'), state: { isDisabled } });

    this.listenTo(durationComponent, 'change:duration', duration => {
      this.action.save({ duration });
    });

    this.showChildView('duration', durationComponent);
  },
  showPermissions() {
    if (this.canEdit) {
      this.getRegion('permissions').empty();
      return;
    }

    this.showChildView('permissions', new PermissionsView());
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
  showFormSharing() {
    const sharing = this.action.get('sharing');

    if (sharing === ACTION_SHARING.DISABLED) return;

    const formSharingView = new FormSharingView({ model: this.action });

    this.listenTo(formSharingView, 'click:response', () => {
      this.triggerMethod('click:form', this.action.getForm());
    });

    this.showChildView('formSharing', formSharingView);
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
