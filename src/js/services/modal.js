import App from 'js/base/app';

import { ModalView, SidebarModalView, SmallModalView, TallModalView } from 'js/views/globals/modal/modal_views';

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
    const ConfirmModal = SmallModalView.extend(options);
    const view = new ConfirmModal();

    this.modalSmallRegion.show(view);

    return view;
  },
  showTall(options) {
    const TallModal = TallModalView.extend(options);
    const view = new TallModal();

    this.modalRegion.show(view);

    return view;
  },
  showCustom(view) {
    this.modalRegion.show(view);
    return view;
  },
  showSidebar(options) {
    const SidebarModal = SidebarModalView.extend(options);
    const view = new SidebarModal();

    this.modalSidebarRegion.show(view);

    return view;
  },
});
