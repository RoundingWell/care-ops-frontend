import _ from 'underscore';

import App from 'js/base/app';

import { ModalView } from 'js/views/globals/modal/modal_views';

export default App.extend({
  channelName: 'modal',
  radioRequests: {
    'show': 'showModal',
    'show:small': 'showSmall',
    'show:tall': 'showTall',
    'show:custom': 'showCustom',
    'show:sidebar': 'showSidebar',
  },
  initialize({ modalRegion, modalSmallRegion, modalSidebarRegion }) {
    this.modalRegion = modalRegion;
    this.modalSmallRegion = modalSmallRegion;
    this.modalSidebarRegion = modalSidebarRegion;
  },
  showModal(options) {
    const ConfirmModal = ModalView.extend(options);
    const view = new ConfirmModal();

    this.modalRegion.show(view);

    return view;
  },
  showSmall(options) {
    const modalOpts = _.extend({
      className: 'modal--small',
      bodyClass: 'modal-content',
    }, options);
    const ConfirmModal = ModalView.extend(modalOpts);
    const view = new ConfirmModal();

    this.modalSmallRegion.show(view);

    return view;
  },
  showTall(options) {
    return this.showModal(_.extend({
      className: 'modal--tall',
      bodyClass: 'modal-content--tall',
    }, options));
  },
  showCustom(view) {
    this.modalRegion.show(view);
    return view;
  },
  showSidebar(options) {
    const SidebarModal = ModalView.extend(_.extend({
      className: 'modal--sidebar',
      bodyClass: 'sidebar',
    }, options));
    const view = new SidebarModal();

    this.modalSidebarRegion.show(view);

    return view;
  },
});
