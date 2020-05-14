import Radio from 'backbone.radio';

import App from 'js/base/app';

import intl from 'js/i18n';

import { LayoutView } from 'js/views/check-ins/check-in/check-in_views';
import { SidebarView } from 'js/views/patients/patient/sidebar/sidebar_views';

export default App.extend({
  onBeforeStart() {
    this.getRegion().startPreloader();
  },
  beforeStart({ checkInId, patientId }) {
    return [
      Radio.request('entities', 'fetch:checkIns:model', checkInId),
      Radio.request('entities', 'fetch:patients:model', patientId),
    ];
  },
  onFail() {
    Radio.request('alert', 'show:error', intl.checkIns.checkInApp.notFound);
    Radio.trigger('event-router', 'default');
  },
  onStart(options, [checkIn], [patient]) {
    this.patient = patient;
    this.checkIn = checkIn;

    this.showView(new LayoutView({
      model: checkIn,
      patient,
    }));

    this.setState('sidebar', 'patient');
  },
  stateEvents: {
    'change:sidebar': 'onChangeSidebar',
  },
  onChangeSidebar(state, sidebar) {
    // if (sidebar === 'engagement') {
    //   this.showEngagementSidebar();
    //   return;
    // }

    this.showPatientSidebar();
  },
  showPatientSidebar() {
    this.showChildView('sidebar', new SidebarView({ model: this.patient }));
  },
  // showEngagementSidebar() {
  //   this.showChildView('sidebar', new SidebarView({ model: this.patient }));
  // },
});
