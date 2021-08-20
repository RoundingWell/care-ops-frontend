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
    const orgWidgets = Radio.request('bootstrap', 'currentOrg:setting', 'widget_sidebar');
    const widgets = Radio.request('entities', 'widgets:collection', collectionOf(orgWidgets, 'id'));

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
