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
import removeNewline from 'js/utils/formatting/remove-newline';
import trim from 'js/utils/formatting/trim';
import keyCodes from 'js/utils/formatting/key-codes';


import { animSidebar } from 'js/anim';

import InputWatcherBehavior from 'js/behaviors/input-watcher';
import Optionlist from 'js/components/optionlist';
import Tooltip from 'js/components/tooltip';

import { PublishedComponent, OwnerComponent, DueDayComponent, FormComponent } from 'js/views/admin/shared/actions_views';

import ActionSidebarTemplate from './action-sidebar.hbs';
import ActionNameTemplate from './action-name.hbs';
import ActionDetailsTemplate from './action-details.hbs';

import 'sass/domain/action-state.scss';

const { ENTER_KEY } = keyCodes;

const DisabledSaveView = View.extend({
  className: 'u-margin--t-8 sidebar__save',
  template: hbs`<button class="button--green" disabled>{{ @intl.admin.sidebar.action.actionSidebarViews.disabledSaveView.saveBtn }}</button>`,
});

const SaveView = View.extend({
  className: 'u-margin--t-8 sidebar__save',
  template: hbs`
    <button class="button--green js-save">{{ @intl.admin.sidebar.action.actionSidebarViews.saveView.saveBtn }}</button>
    <button class="button--text u-margin--r-4 js-cancel">{{ @intl.admin.sidebar.action.actionSidebarViews.saveView.cancelBtn }}</button>
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

const StateView = View.extend({
  className() {
    if (this.model.isNew()) return 'button-secondary w-100 is-disabled';
    return 'button-secondary w-100';
  },
  template: hbs`<span class="action--{{ stateOptions.color }}">{{fa stateOptions.iconType stateOptions.icon}}{{ @intl.admin.sidebar.action.actionSidebarViews.stateView.label }}</span>`,
  templateContext() {
    const currentOrg = Radio.request('bootstrap', 'currentOrg');
    const states = currentOrg.getStates();
    const defaultState = states.at(0);

    return {
      stateOptions: defaultState.get('options'),
    };
  },
  onRender() {
    if (this.model.isNew()) return;

    new Tooltip({
      message: intl.admin.sidebar.action.actionSidebarViews.stateView.tooltip,
      uiView: this,
      ui: this.$el,
    });
  },
});

const TimestampsView = View.extend({
  className: 'sidebar__footer flex',
  template: hbs`
    <div class="sidebar__footer-left"><h4 class="sidebar__label">{{ @intl.admin.sidebar.action.actionSidebarViews.timestampsView.createdAt }}</h4><div>{{formatDateTime created_at "AT_TIME"}}</div></div>
    <div><h4 class="sidebar__label">{{ @intl.admin.sidebar.action.actionSidebarViews.timestampsView.updatedAt }}</h4><div>{{formatDateTime updated_at "AT_TIME"}}</div></div>
  `,
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
    published: '[data-published-region]',
    state: '[data-state-region]',
    owner: '[data-owner-region]',
    due: '[data-due-region]',
    form: '[data-form-region]',
    save: '[data-save-region]',
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
      headingText: intl.admin.sidebar.action.layoutView.menuOptions.headingText,
      itemTemplate: hbs`<span class="sidebar__delete-icon">{{far "trash-alt"}}</span>{{ @intl.admin.sidebar.action.layoutView.menuOptions.delete }}`,
      lists: [{ collection: menuOptions }],
      align: 'right',
      popWidth: 248,
    });

    optionlist.show();
  },
  templateContext() {
    return {
      isNew: this.model.isNew(),
    };
  },
  initialize({ action }) {
    this.action = action;
    this.model = this.action.clone();
    this.listenTo(this.action, {
      'change:status': this.onChangeActionStatus,
      'change:_owner': this.onChangeOwner,
      'change:days_until_due': this.onChangeDueDay,
    });
  },
  onChangeActionStatus() {
    this.showPublished();
  },
  onChangeOwner() {
    this.showOwner();
  },
  onChangeDueDay() {
    this.showDueDay();
  },
  onAttach() {
    animSidebar(this.el);
  },
  onRender() {
    this.showAction();
    this.showTimestamps();
  },
  showAction() {
    this.showEditForm();
    this.showPublished();
    this.showState();
    this.showOwner();
    this.showDueDay();
    this.showForm();
  },
  showEditForm() {
    this.stopListening(this.model);
    this.model = this.action.clone();
    this.listenTo(this.model, 'change:name change:details', this.showSave);

    if (this.model.isNew()) this.showDisabledSave();
    else this.getRegion('save').empty();

    this.showName();
    this.showDetails();
  },
  showName() {
    this.showChildView('name', new NameView({ model: this.model, action: this.action }));
  },
  showDetails() {
    this.showChildView('details', new DetailsView({ model: this.model, action: this.action }));
  },
  showPublished() {
    const isDisabled = this.action.isNew();
    const publishedComponent = new PublishedComponent({ status: this.action.get('status'), state: { isDisabled } });

    this.listenTo(publishedComponent, 'change:status', status => {
      this.action.save({ status });
    });

    this.showChildView('published', publishedComponent);
  },
  showState() {
    this.showChildView('state', new StateView({ model: this.action }));
  },
  showOwner() {
    const isDisabled = this.action.isNew();
    const ownerComponent = new OwnerComponent({ owner: this.action.getOwner(), state: { isDisabled } });

    this.listenTo(ownerComponent, 'change:owner', owner => {
      this.action.saveOwner(owner);
    });

    this.showChildView('owner', ownerComponent);
  },
  showDueDay() {
    const isDisabled = this.action.isNew();
    const dueDayComponent = new DueDayComponent({ day: this.action.get('days_until_due'), state: { isDisabled } });

    this.listenTo(dueDayComponent, 'change:day', day => {
      this.action.save({ days_until_due: day });
    });

    this.showChildView('due', dueDayComponent);
  },
  showForm() {
    const isDisabled = this.action.isNew();
    const formComponent = new FormComponent({ form: this.action.getForm(), state: { isDisabled } });

    this.listenTo(formComponent, {
      'change:form'(form) {
        this.action.saveForm(form);
      },
      'click:form'(form) {
        this.triggerMethod('click:form', form);
      },
    });

    this.showChildView('form', formComponent);
  },
  showTimestamps() {
    if (this.action.isNew()) return;
    this.showChildView('timestamps', new TimestampsView({ model: this.action }));
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

    this.showEditForm();
  },
});

export {
  LayoutView,
};
