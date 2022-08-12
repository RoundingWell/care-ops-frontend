import { bind } from 'underscore';
import anime from 'animejs';
import { View, CollectionView } from 'marionette';

import AlertTemplate from './alert-box.hbs';

import './alert-box.scss';

const OPTIONS = ['alertType', 'text', 'html', 'hasUndo'];

const icons = {
  success: 'circle-check',
  info: 'circle-info',
  error: 'circle-xmark',
};

const AlertView = View.extend({
  className: 'alert-box',
  alertType: 'info',
  template: AlertTemplate,
  triggers: {
    'click .js-dismiss': 'click:dismiss',
    'click .js-undo': 'click:undo',
  },
  initialize(options) {
    this.mergeOptions(options, OPTIONS);
  },
  onAttach() {
    anime({
      targets: this.el,
      duration: 900,
      translateY: [-10, 0],
      opacity: [0, 1],
      easing: 'easeInOutQuad',
    });
  },
  onClickDismiss() {
    this.dismiss();
  },
  onClickUndo() {
    this._dismiss();

    this.triggerMethod('undo', this);
  },
  _dismiss() {
    this.isDismissed = true;

    anime({
      targets: this.el,
      opacity: [1, 0],
      duration: 800,
      easing: 'easeInSine',
      complete: bind(this.destroy, this),
    });
  },
  dismiss() {
    if (this.isDismissed) return;

    this._dismiss();

    this.triggerMethod('dismiss', this);
  },
  templateContext() {
    return {
      alertType: this.alertType,
      text: this.text,
      html: this.html,
      hasUndo: this.hasUndo,
      iconType: icons[this.alertType],
    };
  },
});

const AlertsView = CollectionView.extend({
  className: 'alert-box__container',
  onRemoveChild() {
    if (this.children.length) return;

    this.destroy();
  },
});

export { AlertView, AlertsView };
