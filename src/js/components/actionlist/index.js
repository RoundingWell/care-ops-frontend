import _ from 'underscore';
import { View } from 'marionette';

import hbs from 'handlebars-inline-precompile';

import Picklist from 'js/components/picklist';

const CLASS_OPTIONS = [
  'position',
  'uiView',
  'ui',
];

const CLASS_OPTIONS_ITEM = [
  'attr',
  'getItemFormat',
];

const PicklistItem = View.extend({
  tagName: 'li',
  template: hbs`<a>{{ text }}</a>`,
  className() {
    const classNames = ['picklist__item', 'js-picklist-item'];

    if (this.model.get('isDisabled')) classNames.push('is-disabled');
    if (this.model.get('hasDivider')) classNames.push('has-divider');

    return classNames.join(' ');
  },
  triggers: {
    'click': 'select',
  },
  initialize(options) {
    this.mergeOptions(options, ['state', ...CLASS_OPTIONS_ITEM]);
  },
  templateContext() {
    return {
      text: this.getItemFormat(this.model),
    };
  },
  getItemFormat(item) {
    return item.get(this.attr);
  },
});

export default Picklist.extend({
  attr: 'text',
  PicklistItem,
  constructor(options) {
    this.mergeOptions(options, CLASS_OPTIONS);

    this.listenTo(this.uiView, 'render destroy', this.destroy);

    Picklist.apply(this, arguments);
  },
  viewTriggers: {
    'close': 'close',
    'picklist:item:select': 'select',
  },
  position() {
    return this.uiView.getBounds(this.ui);
  },
  regionOptions() {
    return _.extend({ ignoreEl: this.uiView.el }, _.result(this, 'position'));
  },
  onClose() {
    this.destroy();
  },
  onSelect({ model }) {
    if (model.get('isDisabled')) return;

    const onSelect = model.get('onSelect');
    if (onSelect) onSelect.call(this, model);

    this.destroy();
  },
});
