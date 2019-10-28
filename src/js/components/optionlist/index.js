import _ from 'underscore';
import hbs from 'handlebars-inline-precompile';
import { View } from 'marionette';

import Picklist from 'js/components/picklist';

const CLASS_OPTIONS = [
  'align',
  'ignoreEl',
  'popWidth',
  'position',
  'uiView',
  'ui',
];

const CLASS_OPTIONS_ITEM = [
  'attr',
  'getItemFormat',
  'itemTemplate',
];

const attr = 'text';
const align = 'left';
const popWidth = null;


const PicklistItem = View.extend({
  tagName: 'li',
  itemTemplate: hbs`<a>{{ text }}</a>`,
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
  getTemplate() {
    return this.itemTemplate;
  },
});

export default Picklist.extend({
  attr,
  align,
  popWidth,
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
    return _.extend({
      ignoreEl: this.ignoreEl || this.ui[0],
      popWidth: this.popWidth,
      align: this.align,
    }, _.result(this, 'position'));
  },
  onClose() {
    this.destroy();
  },
  onSelect({ model }) {
    if (model.get('isDisabled')) return;

    const onSelect = model.get('onSelect');
    onSelect.call(this, model);

    this.destroy();
  },
});
