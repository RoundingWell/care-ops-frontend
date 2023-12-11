import Radio from 'backbone.radio';

import App from 'js/base/app';

import { PatientSearchModal } from 'js/views/globals/search/patient-search_views';

export default App.extend({
  onStart({ prefillText, canPatientCreate }) {
    const patientSearchModal = new PatientSearchModal({
      collection: Radio.request('entities', 'searchPatients:collection'),
      prefillText,
      canPatientCreate,
    });

    this.listenTo(patientSearchModal, {
      'search:select'(result) {
        Radio.trigger('event-router', 'patient:dashboard', result.get('_patient'));
        patientSearchModal.destroy();
      },
      'click:addPatient'() {
        this.triggerMethod('click:addPatient');
      },
      'destroy'() {
        this.stop();
      },
    });

    Radio.request('modal', 'show:custom', patientSearchModal);
  },
});
