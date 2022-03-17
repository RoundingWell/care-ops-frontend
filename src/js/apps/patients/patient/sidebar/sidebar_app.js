import { get, map } from 'underscore';
import Radio from 'backbone.radio';

import collectionOf from 'js/utils/formatting/collection-of';
import App from 'js/base/app';

import { SidebarView } from 'js/views/patients/patient/sidebar/sidebar_views';

export default App.extend({
  viewEvents: {
    'click:patientEdit': 'showPatientModal',
    'click:patientView': 'showPatientModal',
  },
  onBeforeStart({ patient }) {
    this.showView(new SidebarView({ model: patient }));
  },
  beforeStart({ patient }) {
    const sidebarWidgets = Radio.request('bootstrap', 'currentOrg:setting', 'widgets_patient_sidebar');
    const widgets = Radio.request('entities', 'widgets:collection', collectionOf(get(sidebarWidgets, 'widgets'), 'id'));
    const requests = map(get(sidebarWidgets, 'fields'), fieldName => patient.fetchField(fieldName));
    requests.unshift(widgets);
    return requests;
  },
  onStart({ patient }, widgets) {
    this.patient = patient;

    this.showView(new SidebarView({
      model: this.patient,
      collection: widgets,
    }));
  },
  showPatientModal() {
    Radio.request('nav', 'patient', this.patient);
  },
});
