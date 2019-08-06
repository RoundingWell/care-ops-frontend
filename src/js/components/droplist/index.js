import _ from 'underscore';
import Backbone from 'backbone';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import 'sass/modules/buttons.scss';

import Component from 'js/base/component';

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
  noResultsText: null,
};

const popWidth = null;

const viewOptions = {
  className: 'button-secondary',
  template: hbs`{{ text }}{{#unless text}}{{ @intl.components.droplist.defaultText }}{{/unless}}`,
};

const StateModel = Backbone.Model.extend({
  defaults: {
    isDisabled: false,
    isActive: false,
    selected: null,
  },
});


const ViewClass = View.extend({
  initialize({ state = {} }) {
    this.model = state.selected;
  },
  attributes() {
    return {
      disabled: this.getOption('state').isDisabled,
    };
  },
  tagName: 'button',
  triggers: {
    'click': 'click',
    'focus': 'focus',
  },
});

export default Component.extend({
  picklistOptions,
  popWidth,
  viewOptions,
  StateModel,
  ViewClass,
  constructor(options) {
    this.mergeOptions(options, CLASS_OPTIONS);

    Component.apply(this, arguments);
  },
  viewEvents: {
    'click': 'onClick',
  },
  onClick() {
    this.toggleState('isActive');
  },
  stateEvents: {
    'change:isDisabled': 'onChangeState',
    'change:isActive': 'onChangeIsActive',
    'change:selected': 'onChangeStateSelected',
  },
  onChangeStateSelected(state, selected) {
    this.show();
    this.triggerMethod('change:selected', selected);
  },
  onChangeState() {
    this.show();
  },
  onChangeIsActive(state, isActive) {
    const view = this.getView();
    view.$el.toggleClass('is-active', isActive);

    if (!isActive) return;

    // blur off the button so enter won't trigger select repeatedly
    view.$el.blur();

    this.showPicklist();
  },
  showPicklist() {
    const picklist = new Picklist(_.extend({
      lists: this.lists || [{ collection: this.collection }],
      state: { selected: this.getState('selected') },
    }, _.result(this, 'picklistOptions')));

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
