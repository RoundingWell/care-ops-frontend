import { extend, result } from 'underscore';

import Picklist from 'js/components/picklist';

// NOTE: Use this if you do not intend to keep the selected state

const CLASS_OPTIONS = [
  'align',
  'ignoreEl',
  'popWidth',
  'position',
  'uiView',
  'ui',
];

const attr = 'text';
const align = 'left';
const popWidth = null;

export default Picklist.extend({
  attr,
  align,
  popWidth,
  itemClassName() {
    const classNames = [];

    if (this.model.get('isDisabled')) classNames.push('is-disabled');
    if (this.model.get('hasDivider')) classNames.push('has-divider');

    return classNames.join(' ');
  },
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
    return extend({
      ignoreEl: this.ignoreEl || this.ui[0],
      popWidth: this.popWidth,
      align: this.align,
    }, result(this, 'position'));
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
