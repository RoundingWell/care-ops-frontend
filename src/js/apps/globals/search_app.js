import Backbone from 'backbone';
import Radio from 'backbone.radio';

import App from 'js/base/app';

import { PatientSearchModal } from 'js/views/globals/search/patient-search_views';

const StateModel = Backbone.Model.extend({
  defaults() {
    return {
      searchType: 'name',
    };
  },
});

export default App.extend({
  StateModel,
  stateEvents: {
    'change:searchType': 'restart',
  },
  onStart({ prefillText }) {
    const settings = Radio.request('bootstrap', 'currentOrg:setting', 'patient_search_settings');

    this.showSearch(prefillText, settings);
  },
  showSearch(prefillText, settings) {
    const patientSearchModal = new PatientSearchModal({
      collection: Radio.request('entities', 'searchPatients:collection'),
      prefillText,
      settings,
      searchType: this.getState('searchType'),
    });

    this.listenTo(patientSearchModal, {
      'item:select'({ model }) {
        Radio.trigger('event-router', 'patient:dashboard', model.get('_patient'));
        patientSearchModal.destroy();
      },
      'select:search:type'(newSearchType) {
        this.setState('searchType', newSearchType);
      },
      'destroy'() {
        this.stop();
      },
    });

    Radio.request('modal', 'show:custom', patientSearchModal);
  },
});
