import _ from 'underscore';
import Backbone from 'backbone';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import intl from 'js/i18n';

import { animSidebar } from 'js/anim';

import InputWatcherBehavior from 'js/behaviors/input-watcher';
import Optionlist from 'js/components/optionlist';

import ProgramDetailsTemplate from './program-details.hbs';
import ProgramNameTemplate from './program-name.hbs';
import ProgramSidebarTemplate from './program-sidebar.hbs';

import './programs-sidebar.scss';

const DisabledSaveView = View.extend({
  className: 'u-margin--t-8 u-text-align--right',
  template: hbs`<button class="button--green" disabled>{{ @intl.admin.sidebar.program.programSidebarViews.disabledSaveView.saveBtn }}</button>`,
});

const SaveView = View.extend({
  className: 'u-margin--t-8 u-text-align--right',
  template: hbs`
    <button class="button--text u-margin--r-4 js-cancel">{{ @intl.admin.sidebar.program.programSidebarViews.saveView.cancelBtn }}</button>
    <button class="button--green js-save">{{ @intl.admin.sidebar.program.programSidebarViews.saveView.saveBtn }}</button>
  `,
  triggers: {
    'click .js-cancel': 'cancel',
    'click .js-save': 'save',
  },
});

const NameView = View.extend({
  template: ProgramNameTemplate,
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
      error: this.getOption('error'),
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
  template: ProgramDetailsTemplate,
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

const LayoutView = View.extend({
  childViewTriggers: {
    'save': 'save',
    'cancel': 'cancel',
  },
  className: 'programs-sidebar flex-region',
  template: ProgramSidebarTemplate,
  regions: {
    name: '[data-name-region]',
    details: '[data-details-region]',
    save: '[data-save-region]',
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
      headingText: intl.admin.sidebar.program.programSidebarViews.layoutView.menuOptions.headingText,
      itemTemplate: hbs`<span class="programs-sidebar__delete-icon">{{far "trash-alt"}}</span>{{ @intl.admin.sidebar.program.programSidebarViews.layoutView.menuOptions.delete }}`,
      lists: [{ collection: menuOptions }],
    });

    optionlist.show();
  },
  initialize({ program }) {
    this.program = program;
    this.model = this.program.clone();
  },
  onAttach() {
    animSidebar(this.el);
  },
  onRender() {
    this.showForm();
  },
  showForm() {
    this.stopListening(this.model);
    this.model = this.program.clone();
    this.listenTo(this.model, 'change:name change:details', this.showSave);

    if (this.model.isNew()) this.showDisabledSave();

    this.showName();
    this.showDetails();
  },
  showName(error) {
    this.showChildView('name', new NameView({ model: this.model, program: this.program, error }));
  },
  showDetails() {
    this.showChildView('details', new DetailsView({ model: this.model, program: this.program }));
  },
  showSave() {
    if (!this.model.isValid()) return this.showDisabledSave();

    this.showChildView('save', new SaveView({ model: this.model }));
  },
  showDisabledSave() {
    this.showChildView('save', new DisabledSaveView());
  },
  onSave() {
    this.showDisabledSave();
  },
  showErrors({ name }) {
    this.showName(name);
  },
  onCancel() {
    if (this.model.isNew()) {
      this.triggerMethod('close', this);
      return;
    }
  },
});

export {
  LayoutView,
};
