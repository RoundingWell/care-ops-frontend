import _ from 'underscore';
import anime from 'animejs';
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'sass/modules/buttons.scss';
import 'sass/modules/forms.scss';
import 'sass/modules/textarea-flex.scss';

import intl from 'js/i18n';

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
      isDone: this.model.isDone(),
    };
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
      isDone: this.model.isDone(),
    };
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
    this.listenTo(this.action, 'change:_state', this.onChangeActionState);
  },
  _isDone(stateId) {
    const state = Radio.request('entities', 'states:model', stateId);
    return state.get('status') === 'done';
  },
  onChangeActionState() {
    if (!this._isDone(this.action.get('_state')) && !this._isDone(this.action.previous('_state'))) return;

    this.showAction();
  },
  onAttach() {
    anime({
      targets: this.el,
      translateX: [{ value: 20, duration: 0 }, { value: 0, duration: 200 }],
      opacity: [{ value: 0, duration: 0 }, { value: 1, duration: 300 }],
      easing: 'easeInOutQuad',
    });
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
    this.showChildView('name', new NameView({ model: this.model, action: this.action }));
  },
  showDetails() {
    this.showChildView('details', new DetailsView({ model: this.model, action: this.action }));
  },
  showState() {
    const isDisabled = this.action.isNew();
    const stateComponent = new StateComponent({ model: this.action, state: { isDisabled } });

    this.listenTo(stateComponent, 'change:state', state => {
      this.action.saveState(state);
    });

    this.showChildView('state', stateComponent);
  },
  showOwner() {
    const isDisabled = this.action.isNew() || this.action.isDone();
    const ownerComponent = new OwnerComponent({ model: this.action, state: { isDisabled } });

    this.listenTo(ownerComponent, 'change:owner', owner => {
      this.action.saveOwner(owner);
    });

    this.showChildView('owner', ownerComponent);
  },
  showDue() {
    const isDisabled = this.action.isNew() || this.action.isDone();
    const dueComponent = new DueComponent({ model: this.action, state: { isDisabled } });

    this.listenTo(dueComponent, 'change:due', date => {
      this.action.saveDue(date);
    });

    this.showChildView('due', dueComponent);
  },
  showDuration() {
    const isDisabled = this.action.isNew() || this.action.isDone();
    const durationComponent = new DurationComponent({ model: this.action, state: { isDisabled } });

    this.listenTo(durationComponent, 'change:duration', duration => {
      this.action.save({ duration });
    });

    this.showChildView('duration', durationComponent);
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
