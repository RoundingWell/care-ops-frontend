import _ from 'underscore';

import App from 'js/base/app';

import { ModalView } from 'js/views/globals/modal/modal_views';

export default App.extend({
  channelName: 'modal',
  radioRequests: {
    'show': 'showModal',
    'show:small': 'showSmall',
    'show:tall': 'showTall',
  },
  initialize({ modalRegion, modalSmallRegion }) {
    this.modalRegion = modalRegion;
    this.modalSmallRegion = modalSmallRegion;
  },
  showModal(options) {
    const ConfirmModal = ModalView.extend(options);

    return this.modalRegion.show(new ConfirmModal());
  },
  showSmall(options) {
    const modalOpts = _.extend({
      className: 'modal--small',
      bodyClass: 'modal-content',
    }, options);
    const ConfirmModal = ModalView.extend(modalOpts);

    return this.modalSmallRegion.show(new ConfirmModal());
  },
  showTall(options) {
    return this.showModal(_.extend({
      className: 'modal--tall',
      bodyClass: 'modal-content--tall',
    }, options));
  },
});
