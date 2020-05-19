import Radio from 'backbone.radio';

import App from 'js/base/app';

import intl from 'js/i18n';

import PatientSidebarApp from 'js/apps/patients/patient/sidebar/sidebar_app';

import { LayoutView } from 'js/views/check-ins/check-in/check-in_views';

export default App.extend({
  childApps: {
    patient: PatientSidebarApp,
  },
  onBeforeStart() {
    this.getRegion().startPreloader();
  },
  beforeStart({ checkInId, patientId }) {
    return [
      Radio.request('entities', 'fetch:checkIns:model', { checkInId, patientId }),
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

    this.showPatientSidebar();
  },
  showPatientSidebar() {
    this.startChildApp('patient', {
      region: this.getRegion('sidebar'),
      patient: this.patient,
    });
  },
});
