import _ from 'underscore';
import { View } from 'marionette';

import Component from 'js/base/component';

import hbs from 'handlebars-inline-precompile';

import anime from 'animejs';

import './tooltip.scss';

const CLASS_OPTIONS = [
  'className',
  'delay',
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
  initialize(options) {
    this.mergeOptions(options, CLASS_OPTIONS);

    this.setListeners();

    this.listenTo(this.uiView, 'render destroy', this.destroy);
  },
  setListeners() {
    if (!this.ui) return;

    this.ui.on('mouseenter.tooltip', _.bind(this.showTooltip, this));

    this.ui.on('mouseleave.tooltip', _.bind(this.hideTooltip, this));
  },
  showTooltip() {
    clearTimeout(this.delayTimeout);

    const delay = _.result(this, 'delay');

    this.delayTimeout = _.delay(_.bind(this.show, this), delay);
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
      targets: this.currentView.el,
      duration: 1500,
      opacity: [0, 1],
    });
  },
  viewOptions() {
    return {
      className: _.result(this, 'className'),
      position: this.getPosition(),
      orientation: _.result(this, 'orientation'),
      message: _.result(this, 'message'),
      messageHtml: _.result(this, 'messageHtml'),
    };
  },
  getPosition() {
    return this.uiView.getBounds(this.ui);
  },
});
