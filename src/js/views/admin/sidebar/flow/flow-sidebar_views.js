import _ from 'underscore';
import Backbone from 'backbone';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'sass/modules/buttons.scss';
import 'sass/modules/forms.scss';
import 'sass/modules/textarea-flex.scss';
import 'sass/modules/sidebar.scss';

import intl from 'js/i18n';

import { animSidebar } from 'js/anim';

import InputWatcherBehavior from 'js/behaviors/input-watcher';
import Optionlist from 'js/components/optionlist';
import Tooltip from 'js/components/tooltip';

import { PublishedComponent, OwnerComponent } from 'js/views/admin/actions/actions_views';

import FlowSidebarTemplate from './flow-sidebar.hbs';
import FlowNameTemplate from './flow-name.hbs';
import FlowDetailsTemplate from './flow-details.hbs';

import 'sass/domain/action-state.scss';

const DisabledSaveView = View.extend({
  className: 'u-margin--t-8 u-text-align--right',
  template: hbs`<button class="button--green" disabled>{{ @intl.admin.sidebar.flow.flowSidebarViews.disabledSaveView.saveBtn }}</button>`,
});

const SaveView = View.extend({
  className: 'u-margin--t-8 u-text-align--right',
  template: hbs`
    <button class="button--text u-margin--r-4 js-cancel">{{ @intl.admin.sidebar.flow.flowSidebarViews.saveView.cancelBtn }}</button>
    <button class="button--green js-save">{{ @intl.admin.sidebar.flow.flowSidebarViews.saveView.saveBtn }}</button>
  `,
  triggers: {
    'click .js-cancel': 'cancel',
    'click .js-save': 'save',
  },
});

const NameView = View.extend({
  className: 'pos--relative',
  template: FlowNameTemplate,
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
  template: FlowDetailsTemplate,
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
});

const StateView = View.extend({
  className() {
    if (this.model.isNew()) return 'button-secondary w-100 is-disabled';
    return 'button-secondary w-100';
  },
  template: hbs`<span class="action--queued">{{fas "exclamation-circle"}}{{ @intl.admin.sidebar.flow.flowSidebarViews.stateView.label }}</span>`,
  onRender() {
    if (this.model.isNew()) return;

    new Tooltip({
      message: intl.admin.sidebar.flow.flowSidebarViews.stateView.tooltip,
      uiView: this,
      ui: this.$el,
    });
  },
});

const TimestampsView = View.extend({
  className: 'sidebar__timestamps',
  template: hbs`
    <div><h4 class="sidebar__label">{{ @intl.admin.sidebar.flow.flowSidebarViews.timestampsView.createdAt }}</h4>{{formatMoment created_at "AT_TIME"}}</div>
    <div><h4 class="sidebar__label">{{ @intl.admin.sidebar.flow.flowSidebarViews.timestampsView.updatedAt }}</h4>{{formatMoment updated_at "AT_TIME"}}</div>
  `,
});

const LayoutView = View.extend({
  childViewTriggers: {
    'save': 'save',
    'cancel': 'cancel',
  },
  className: 'sidebar flex-region',
  template: FlowSidebarTemplate,
  regions: {
    name: '[data-name-region]',
    details: '[data-details-region]',
    published: '[data-published-region]',
    state: '[data-state-region]',
    owner: '[data-owner-region]',
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
      headingText: intl.admin.sidebar.flow.layoutView.menuOptions.headingText,
      itemTemplate: hbs`<span class="sidebar__delete-icon">{{far "trash-alt"}}</span>{{ @intl.admin.sidebar.flow.layoutView.menuOptions.delete }}`,
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
  initialize({ flow }) {
    this.flow = flow;
    this.model = this.flow.clone();
    this.listenTo(this.flow, {
      'change:status': this.onChangeFlowStatus,
      'change:_owner': this.onChangeOwner,
    });
  },
  onChangeFlowStatus() {
    this.showPublished();
  },
  onChangeOwner() {
    this.showOwner();
  },
  onAttach() {
    animSidebar(this.el);
  },
  onRender() {
    this.showFlow();
    this.showTimestamps();
  },
  showFlow() {
    this.showForm();
    this.showPublished();
    this.showState();
    this.showOwner();
  },
  showForm() {
    this.stopListening(this.model);
    this.model = this.flow.clone();
    this.listenTo(this.model, 'change:name change:details', this.showSave);

    if (this.model.isNew()) this.showDisabledSave();
    else this.getRegion('save').empty();

    this.showName();
    this.showDetails();
  },
  showName() {
    this.showChildView('name', new NameView({ model: this.model, flow: this.flow }));
  },
  showDetails() {
    this.showChildView('details', new DetailsView({ model: this.model, flow: this.flow }));
  },
  showPublished() {
    const isDisabled = this.flow.isNew();
    const publishedComponent = new PublishedComponent({ model: this.flow, state: { isDisabled } });

    this.listenTo(publishedComponent, 'change:status', status => {
      this.flow.save({ status });
    });

    this.showChildView('published', publishedComponent);
  },
  showState() {
    this.showChildView('state', new StateView({ model: this.flow }));
  },
  showOwner() {
    const isDisabled = this.flow.isNew();
    const ownerComponent = new OwnerComponent({ model: this.flow, state: { isDisabled } });

    this.listenTo(ownerComponent, 'change:owner', owner => {
      this.flow.saveOwner(owner);
    });

    this.showChildView('owner', ownerComponent);
  },
  showTimestamps() {
    if (this.flow.isNew()) return;
    this.showChildView('timestamps', new TimestampsView({ model: this.flow }));
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
