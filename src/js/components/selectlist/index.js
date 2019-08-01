import _ from 'underscore';
import Backbone from 'backbone';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'sass/modules/buttons.scss';

import intl from 'js/i18n';

import Component from 'js/base/component';

import InputWatcherBehavior from 'js/behaviors/input-watcher';

import Picklist from 'js/components/picklist';

const CLASS_OPTIONS = [
  'collection',
  'lists',
  'picklistEvents',
  'picklistOptions',
  'popRegion',
  'popWidth',
  'position',
];

const picklistOptions = {
  attr: 'text',
  headingText: null,
  noResultsText: intl.components.selectlist.noResultsText,
};

const popWidth = null;

const StateModel = Backbone.Model.extend({
  defaults: {
    isDisabled: false,
    isActive: false,
    selected: null,
  },
});


const ButtonView = View.extend({
  tagName: 'span',
  buttonTemplate: hbs`<button class="button--white w-100 js-button"{{#if isDisabled}} disabled{{/if}}>{{ text }}{{#unless text}}{{ @intl.components.selectlist.defaultText }}{{/unless}}</button>`,
  initialize({ state = {} }) {
    this.model = state.selected;
  },
  triggers: {
    'click @ui.button': 'click',
    'focus @ui.button': 'focus',
  },
  ui: {
    button: 'button',
  },
  getTemplate() {
    return this.getOption('buttonTemplate');
  },
  templateContext() {
    return {
      isDisabled: this.getOption('state').isDisabled,
    };
  },
});

const InputView = View.extend({
  tagName: 'span',
  inputTemplate: hbs`<input class="input--general w-100 js-input" type="text">`,
  initialize({ state = {} }) {
    this.model = state.selected;
  },
  triggers: {
    'click @ui.input': 'input:click',
    'focus @ui.input': 'focus',
  },
  behaviors: [InputWatcherBehavior],
  ui: { input: '.js-input' },
  onDomRefresh() {
    this.ui.input.focus();
  },
  getTemplate() {
    return this.getOption('inputTemplate');
  },
});

export default Component.extend({
  picklistOptions,
  popWidth,
  StateModel,
  // FIXME: Disabling input by default for now
  disableInput: true,
  ViewClass() {
    if (this.disableInput) return ButtonView;
    return this.getState('isActive') ? InputView : ButtonView;
  },
  constructor(options) {
    this.mergeOptions(options, CLASS_OPTIONS);

    Component.apply(this, arguments);
  },
  viewEvents: {
    'click': 'onClick',
    'watch:change': 'onWatchChange',
  },
  onClick() {
    this.toggleState('isActive');
  },
  onWatchChange(query) {
    this.setState('query', query);
  },
  stateEvents: {
    'change:isDisabled': 'onChangeState',
    'change:isActive': 'onChangeState',
    'change:selected': 'onChangeStateSelected',
  },
  onChangeStateSelected(state, selected) {
    this.show();
    this.triggerMethod('change:selected', selected);
  },
  onChangeState() {
    this.show();
  },
  onShow() {
    this.setState('query', '');

    const isActive = this.getState('isActive');

    if (!isActive) return;

    this.showPicklist();
  },
  showPicklist() {
    const picklist = new Picklist(_.extend({
      lists: this.lists || [{ collection: this.collection }],
      state: { selected: this.getState('selected') },
    }, _.result(this, 'picklistOptions')));

    // Proxy query to picklist state
    picklist.listenTo(this.getState(), 'change:query', (state, query) => {
      picklist.setState({ query });
    });

    this.popRegion.show(picklist, this.popRegionOptions());

    this.bindEvents(picklist.getView(), this._picklistEvents);
    this.bindEvents(picklist.getView(), _.result(this, 'picklistEvents'));
  },
  position() {
    return this.getView().getBounds();
  },
  popRegionOptions() {
    return _.extend({
      ignoreEl: this.getView().el,
      popWidth: _.result(this, 'popWidth'),
    }, _.result(this, 'position'));
  },
  _picklistEvents: {
    'close': 'onPicklistClose',
    'picklist:item:select': 'onPicklistSelect',
    'destroy': 'onPicklistDestroy',
  },
  onPicklistClose() {
    this.popRegion.empty();
  },
  onPicklistSelect({ model }) {
    this.setState('selected', model);
    this.popRegion.empty();
  },
  onPicklistDestroy() {
    this.toggleState('isActive', false);
  },
}, {
  setPopRegion(region) {
    this.prototype.popRegion = region;
  },
});
