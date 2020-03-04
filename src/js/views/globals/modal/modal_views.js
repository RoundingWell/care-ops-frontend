import _ from 'underscore';
import { View, Region } from 'marionette';

import 'sass/modules/buttons.scss';
import 'sass/modules/modals.scss';

import intl from 'js/i18n';

import PreloadRegion from 'js/regions/preload_region';

import ModalTemplate from './modal.hbs';

const i18n = intl.globals.modal.modalViews;

const ReplaceElRegion = Region.extend({ replaceElement: true, timeout: 0 });

const NoFooterView = View.extend({
  className: 'modal-footer--empty',
  template: false,
});

const ModalView = View.extend({
  className: 'modal',
  buttonClass: 'button--blue',
  bodyClass: 'modal-content',
  cancelText: i18n.modalView.cancelText,
  submitText: i18n.modalView.submitText,
  regionClass: ReplaceElRegion,
  regions: {
    header: '[data-header-region]',
    body: {
      el: '[data-body-region]',
      regionClass: PreloadRegion.extend({ timeout: 0 }),
    },
    footer: '[data-footer-region]',
  },
  childViewTriggers: {
    'cancel': 'cancel',
    'submit': 'submit',
  },
  triggers: {
    'click @ui.close': 'cancel',
    'click @ui.submit': 'submit',
  },
  ui: {
    close: '.js-close',
    submit: '.js-submit',
  },
  serializeData() {
    // Passes data on the view to the template
    return _.extend({}, this);
  },
  template: ModalTemplate,
  initialize(options) {
    this.mergeOptions(options, ['headerView', 'bodyView', 'footerView']);

    if (this.headerView) this.showChildView('header', this.headerView);
    if (this.bodyView) this.showChildView('body', this.bodyView);
    if (this.footerView) this.showChildView('footer', this.footerView);
    if (this.footerView === false) this.showChildView('footer', new NoFooterView());
  },
  onSubmit() {
    this.destroy();
  },
  onCancel() {
    this.destroy();
  },
  disableSubmit(disable) {
    this.ui.submit.prop('disabled', disable);
  },
  startPreloader() {
    this.getRegion('body').startPreloader();
  },
});

export {
  ModalView,
};
