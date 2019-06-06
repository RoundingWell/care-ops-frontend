import _ from 'underscore';
import Backbone from 'backbone';
import { View } from 'marionette';

import 'sass/modules/buttons.scss';

import hbs from 'handlebars-inline-precompile';

import Component from 'js/base/component';

import Picklist from 'js/components/picklist';

const CLASS_OPTIONS = [
  'collection',
  'defaultText',
  'headingText',
  'lists',
  'picklistEvents',
  'picklistOptions',
  'popRegion',
  'popWidth',
  'position',
];

const CLASS_OPTIONS_BUTTON = [
  'className',
  'template',
];

const StateModel = Backbone.Model.extend({
  defaults: {
    isDisabled: false,
    isActive: false,
    selected: null,
  },
});

const ViewClass = View.extend({
  attributes() {
    return {
      disabled: this.getOption('isDisabled'),
    };
  },
  tagName: 'button',
  triggers: {
    'click': 'click',
    'focus': 'focus',
  },
});

export default Component.extend({
  popWidth: null,
  StateModel,
  ViewClass,
  className: 'button--blue',
  template: hbs`{{ text }}{{#unless text}}{{ @intl.components.droplist.defaultText }}{{/unless}}`,
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
  },
  onClick() {
    this.toggleState('isActive');
  },
  stateEvents: {
    'change:isDisabled': 'onChangeState',
    'change:isActive': 'onChangeIsActive',
    'change:selected': 'onChangeState',
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
      headingText: this.headingText,
      lists: this.lists || [{ collection: this.collection }],
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
