import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'sass/modules/buttons.scss';
import 'sass/modules/textarea-flex.scss';
import 'sass/modules/sidebar.scss';

import keyCodes from 'js/utils/formatting/key-codes';
import removeNewline from 'js/utils/formatting/remove-newline';
import trim from 'js/utils/formatting/trim';

import { animSidebar } from 'js/anim';

import InputWatcherBehavior from 'js/behaviors/input-watcher';
import SidebarBehavior from 'js/behaviors/sidebar';

import ProgramDetailsTemplate from './program-details.hbs';
import ProgramNameTemplate from './program-name.hbs';
import ProgramSidebarTemplate from './program-sidebar.hbs';
import ProgramStateTemplate from './program-state.hbs';

import './programs-sidebar.scss';

const { ENTER_KEY } = keyCodes;

const DisabledSaveView = View.extend({
  className: 'u-margin--t-8 sidebar__save',
  template: hbs`<button class="button--green" disabled>{{ @intl.programs.sidebar.program.programsSidebarViews.disabledSaveView.saveBtn }}</button>`,
});

const SaveView = View.extend({
  className: 'u-margin--t-8 sidebar__save',
  template: hbs`
    <button class="button--green js-save">{{ @intl.programs.sidebar.program.programsSidebarViews.saveView.saveBtn }}</button>
    <button class="button--text u-margin--r-4 js-cancel">{{ @intl.programs.sidebar.program.programsSidebarViews.saveView.cancelBtn }}</button>
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

    this.model.set('details', trim(text));
  },
});

const StateView = View.extend({
  template: ProgramStateTemplate,
  triggers: {
    'click .js-state-toggle': 'click:toggle',
  },
  modelEvents: {
    'change:published': 'render',
  },
});

const TimestampsView = View.extend({
  className: 'sidebar__footer flex',
  template: hbs`
    <div class="sidebar__footer-left"><h4 class="sidebar__label">{{ @intl.programs.sidebar.program.programsSidebarViews.timestampsView.createdAt }}</h4><div>{{formatDateTime created_at "AT_TIME"}}</div></div>
    <div><h4 class="sidebar__label">{{ @intl.programs.sidebar.program.programsSidebarViews.timestampsView.updatedAt }}</h4><div>{{formatDateTime updated_at "AT_TIME"}}</div></div>
  `,
});

const LayoutView = View.extend({
  childViewTriggers: {
    'save': 'save',
    'cancel': 'cancel',
    'toggle': 'toggle',
  },
  className: 'sidebar flex-region',
  behaviors: [SidebarBehavior],
  template: ProgramSidebarTemplate,
  regions: {
    name: '[data-name-region]',
    details: '[data-details-region]',
    state: '[data-state-region]',
    save: '[data-save-region]',
    timestamps: '[data-timestamps-region]',
  },
  triggers: {
    'click .js-close': 'close',
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
    this.showState();
    this.showTimestamps();
  },
  showForm() {
    this.stopListening(this.model);
    this.model = this.program.clone();
    this.listenTo(this.model, 'change:name change:details', this.showSave);

    if (this.model.isNew()) this.showDisabledSave();
    else this.getRegion('save').empty();

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
  showState() {
    if (this.program.isNew()) return;
    const stateView = new StateView({ model: this.program, program: this.program });

    this.listenTo(stateView, 'click:toggle', () => {
      this.program.save({ published: !this.program.get('published') });
    });

    this.showChildView('state', stateView);
  },
  showTimestamps() {
    if (this.program.isNew()) return;
    this.showChildView('timestamps', new TimestampsView({ model: this.program }));
  },
  showDisabledSave() {
    this.showChildView('save', new DisabledSaveView());
  },
  onSave() {
    if (this.model.isNew()) this.showDisabledSave();
    else this.getRegion('save').empty();
  },
  showErrors({ name }) {
    this.showName(name);
    this.showDisabledSave();
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
