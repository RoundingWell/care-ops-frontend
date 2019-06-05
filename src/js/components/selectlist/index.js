import _ from 'underscore';
import Backbone from 'backbone';
import { View } from 'marionette';

import 'sass/modules/buttons.scss';

import intl from 'js/i18n';
import hbs from 'handlebars-inline-precompile';

import Component from 'js/base/component';

import InputWatcherBehavior from 'js/behaviors/input-watcher';

import Picklist from 'js/components/picklist';

const CLASS_OPTIONS = [
  'attr',
  'collection',
  'defaultText',
  'headingText',
  'lists',
  'noResultsText',
  'picklistOptions',
  'popRegion',
  'popWidth',
  'position',
];

const CLASS_OPTIONS_BUTTON = [
  'buttonTemplate',
  'className',
  'inputTemplate',
  'tagName',
];

const StateModel = Backbone.Model.extend({
  defaults: {
    isDisabled: false,
    isActive: false,
    selected: null,
  },
});

const ButtonView = View.extend({
  triggers: {
    'click @ui.button': 'click',
    'focus @ui.button': 'focus',
  },
  ui: {
    button: '.js-button',
  },
  getTemplate() {
    return this.getOption('buttonTemplate');
  },
  templateContext() {
    return {
      isDisabled: this.getOption('isDisabled'),
    };
  },
});

const InputView = View.extend({
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
  attr: 'text',
  noResultsText: intl.components.selectlist.noResultsText,
  popWidth: null,
  StateModel,
  ViewClass() {
    return this.getState('isActive') ? InputView : ButtonView;
  },
  className: 'w-20',
  tagName: 'span',
  buttonTemplate: hbs`<button class="button--blue w-100 js-button"{{#if isDisabled}} disabled{{/if}}>{{ text }}{{#unless text}}{{ @intl.components.selectlist.defaultText }}{{/unless}}</button>`,
  inputTemplate: hbs`<input class="input--general w-100 js-input" type="text">`,
  constructor(options) {
    this.mergeOptions(options, CLASS_OPTIONS);
    this.mergeOptions(options, CLASS_OPTIONS_BUTTON);

    Component.apply(this, arguments);
  },
  viewOptions() {
    const opts = _.pick(this, CLASS_OPTIONS_BUTTON);

    return _.extend({
      isDisabled: this.getState('isDisabled'),
      model: this.getState('selected'),
    }, opts);
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
      attr: this.attr,
      headingText: this.headingText,
      noResultsText: this.noResultsText,
      lists: this.lists || [{ collection: this.collection }],
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
      popWidth: this.popWidth,
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
