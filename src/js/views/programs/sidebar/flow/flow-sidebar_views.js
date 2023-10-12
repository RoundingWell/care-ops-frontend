import { bind, extend } from 'underscore';
import dayjs from 'dayjs';
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'scss/modules/buttons.scss';
import 'scss/modules/forms.scss';
import 'scss/modules/textarea-flex.scss';
import 'scss/modules/sidebar.scss';

import intl from 'js/i18n';
import keyCodes from 'js/utils/formatting/key-codes';
import removeNewline from 'js/utils/formatting/remove-newline';
import trim from 'js/utils/formatting/trim';

import { animSidebar } from 'js/anim';

import InputWatcherBehavior from 'js/behaviors/input-watcher';
import Optionlist from 'js/components/optionlist';

import { FlowBehaviorComponent, OwnerComponent } from 'js/views/programs/shared/flows_views';
import TagsManagerComponent from 'js/views/programs/shared/components/tags-manager_component';
import ToggleComponent from 'js/views/programs/shared/components/toggle_component';

import FlowSidebarTemplate from './flow-sidebar.hbs';
import FlowNameTemplate from './flow-name.hbs';
import FlowDetailsTemplate from './flow-details.hbs';

import './flow-sidebar.scss';

const i18n = intl.programs.sidebar.flow.flowSidebarViews;

const { ENTER_KEY } = keyCodes;

const DisabledSaveView = View.extend({
  className: 'u-margin--t-8 sidebar__save',
  template: hbs`<button class="button--green" disabled>{{ @intl.programs.sidebar.flow.flowSidebarViews.disabledSaveView.saveBtn }}</button>`,
});

const SaveView = View.extend({
  className: 'u-margin--t-8 sidebar__save',
  template: hbs`
    <button class="button--green js-save">{{ @intl.programs.sidebar.flow.flowSidebarViews.saveView.saveBtn }}</button>
    <button class="button--text u-margin--r-4 js-cancel">{{ @intl.programs.sidebar.flow.flowSidebarViews.saveView.cancelBtn }}</button>
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
  template: FlowDetailsTemplate,
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

const TimestampsView = View.extend({
  className: 'sidebar__footer flex',
  template: hbs`
    <div class="sidebar__footer-left"><h4 class="sidebar__label">{{ @intl.programs.sidebar.flow.flowSidebarViews.timestampsView.createdAt }}</h4><div>{{formatDateTime created_at "AT_TIME"}}</div></div>
    <div><h4 class="sidebar__label">{{ @intl.programs.sidebar.flow.flowSidebarViews.timestampsView.updatedAt }}</h4><div>{{formatDateTime updated_at "AT_TIME"}}</div></div>
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
    archived: '[data-archived-region]',
    behavior: '[data-behavior-region]',
    owner: '[data-owner-region]',
    tags: '[data-tags-region]',
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
        onSelect: bind(this.triggerMethod, this, 'delete'),
      },
    ]);

    const optionlist = new Optionlist({
      ui: this.ui.menu,
      uiView: this,
      headingText: intl.programs.sidebar.flow.layoutView.menuOptions.headingText,
      itemTemplate: hbs`{{far "trash-can" classes="sidebar__delete-icon"}}<span>{{ @intl.programs.sidebar.flow.layoutView.menuOptions.delete }}</span>`,
      lists: [{ collection: menuOptions }],
      align: 'right',
      popWidth: 248,
    });

    optionlist.show();
  },
  templateContext() {
    const isNew = this.model.isNew();

    return {
      isNew,
      canTag: !isNew && this.currentUser.can('programs:tags:manage'),
    };
  },
  initialize({ flow, tags }) {
    this.currentUser = Radio.request('bootstrap', 'currentUser');
    this.tags = tags;
    this.flow = flow;
    this.model = this.flow.clone();
    this.listenTo(this.flow, {
      'change:published_at change:archived_at change:behavior': this.onChangeFlowStatus,
      'change:_owner': this.onChangeOwner,
    });
  },
  onChangeFlowStatus() {
    this.showPublished();
    this.showArchived();
    this.showBehavior();
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
    this.showArchived();
    this.showBehavior();
    this.showOwner();
    this.showTags();
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
    const published = !!this.flow.get('published_at');
    const isDisabled = this.flow.isNew();

    const toggleView = new ToggleComponent({
      status: published,
      isDisabled,
    });

    this.listenTo(toggleView, 'click', () => {
      const newPublishedAt = published ? null : dayjs.utc().format();
      this.flow.save({ published_at: newPublishedAt });
    });

    this.showChildView('published', toggleView);
  },
  showArchived() {
    const archived = !!this.flow.get('archived_at');
    const isDisabled = this.flow.isNew();

    const toggleView = new ToggleComponent({
      status: archived,
      isDisabled,
    });

    this.listenTo(toggleView, 'click', () => {
      const newArchivedAt = archived ? null : dayjs.utc().format();
      this.flow.save({ archived_at: newArchivedAt });
    });

    this.showChildView('archived', toggleView);
  },
  showBehavior() {
    const isDisabled = this.flow.isNew();
    const behaviorComponent = new FlowBehaviorComponent({
      behavior: this.flow.get('behavior'),
      state: { isDisabled },
    });

    this.listenTo(behaviorComponent, 'change:status', ({ behavior }) => {
      this.flow.save({ behavior });
    });

    this.showChildView('behavior', behaviorComponent);
  },
  showOwner() {
    const isDisabled = this.flow.isNew();
    const ownerComponent = new OwnerComponent({ owner: this.flow.getOwner(), state: { isDisabled } });

    this.listenTo(ownerComponent, 'change:owner', owner => {
      this.flow.saveOwner(owner);
    });

    this.showChildView('owner', ownerComponent);
  },
  showTags() {
    if (this.model.isNew() || !this.currentUser.can('programs:tags:manage')) return;

    const tagsComponent = new TagsManagerComponent({
      allTags: this.tags,
      tags: this.flow.getTags(),
    });

    this.listenTo(tagsComponent, {
      'add:tag'(tag) {
        this.flow.addTag(tag);
      },
      'remove:tag'(tag) {
        this.flow.removeTag(tag);
      },
    });

    this.showChildView('tags', tagsComponent);
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

function getDeleteModal(opts) {
  return extend({ buttonClass: 'button--red' }, i18n.deleteModal, opts);
}

export {
  getDeleteModal,
  LayoutView,
};
