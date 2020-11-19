import { bind, delay as _delay, extend, result } from 'underscore';
import hbs from 'handlebars-inline-precompile';
import anime from 'animejs';
import { View } from 'marionette';

import Component from 'js/base/component';

import './tooltip.scss';

const CLASS_OPTIONS = [
  'className',
  'delay',
  'ignoreEl',
  'message',
  'messageHtml',
  'orientation',
  'position',
  'uiView',
  'ui',
];

const TooltipView = View.extend({
  template: hbs`{{ message }}{{{ messageHtml }}}`,
  templateContext() {
    return {
      message: this.getOption('message'),
      messageHtml: this.getOption('messageHtml'),
    };
  },
});

export default Component.extend({
  ViewClass: TooltipView,
  className: 'tooltip',
  delay: 0,
  constructor(options) {
    this.mergeOptions(options, CLASS_OPTIONS);

    this.setListeners();

    this.listenTo(this.uiView, 'render destroy', this.destroy);

    Component.apply(this, arguments);
  },
  setListeners() {
    if (!this.ui) return;

    this.ui.on('mouseenter.tooltip', bind(this.showTooltip, this));

    this.ui.on('mouseleave.tooltip', bind(this.hideTooltip, this));
  },
  showTooltip() {
    clearTimeout(this.delayTimeout);

    const delay = result(this, 'delay');

    this.delayTimeout = _delay(bind(this.show, this), delay);
  },
  hideTooltip() {
    clearTimeout(this.delayTimeout);

    this.empty();
  },
  onBeforeDestroy() {
    clearTimeout(this.delayTimeout);
  },
  onShow() {
    anime({
      targets: this.getView().el,
      duration: 1500,
      opacity: [0, 1],
    });
  },
  viewOptions() {
    return {
      className: result(this, 'className'),
      message: result(this, 'message'),
      messageHtml: result(this, 'messageHtml'),
    };
  },
  position() {
    return this.uiView.getBounds(this.ui);
  },
  regionOptions() {
    const orientation = result(this, 'orientation');
    const ignoreEl = result(this, 'ignoreEl');
    return extend({ orientation, ignoreEl }, result(this, 'position'));
  },
});
