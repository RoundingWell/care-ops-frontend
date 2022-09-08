import Radio from 'backbone.radio';

import App from 'js/base/app';

import { PatientSearchModal } from 'js/views/globals/search/patient-search_views';

export default App.extend({
  onStart({ prefillText }) {
    const settings = Radio.request('bootstrap', 'currentOrg:setting', 'patient_search');

    this.showSearch(prefillText, settings);
  },
  showSearch(prefillText, settings) {
    const patientSearchModal = new PatientSearchModal({
      collection: Radio.request('entities', 'searchPatients:collection'),
      prefillText,
      settings,
    });

    this.listenTo(patientSearchModal, {
      'item:select'({ model }) {
        Radio.trigger('event-router', 'patient:dashboard', model.get('_patient'));
        patientSearchModal.destroy();
      },
      'destroy'() {
        this.stop();
      },
    });

    Radio.request('modal', 'show:custom', patientSearchModal);
  },
});
