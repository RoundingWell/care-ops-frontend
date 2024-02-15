import { map } from 'underscore';
import Radio from 'backbone.radio';

import App from 'js/base/app';

import { SidebarView } from 'js/views/patients/patient/sidebar/sidebar_views';

export default App.extend({
  viewEvents: {
    'click:patientEdit': 'showPatientModal',
    'click:patientView': 'showPatientModal',
    'click:activeStatus': 'toggleActiveStatus',
    'click:archivedStatus': 'archivePatient',
  },
  onBeforeStart({ patient }) {
    this.showView(new SidebarView({ model: patient }));

    this.widgets = Radio.request('bootstrap', 'sidebarWidgets');

    this.getRegion('widgets').startPreloader();
  },
  beforeStart({ patient }) {
    const workspacePatient = Radio.request('entities', 'fetch:workspacePatients:byPatient', patient.id);
    const fields = map(Radio.request('bootstrap', 'sidebarWidgets:fields'), fieldName => {
      return Radio.request('entities', 'fetch:patientFields:model', patient.id, fieldName);
    });
    const values = this.widgets.invoke('fetchValues', patient.id);

    return [workspacePatient, ...fields, ...values];
  },
  onStart({ patient }) {
    this.patient = patient;

    this.showView(new SidebarView({
      model: this.patient,
      collection: this.widgets,
    }));
  },
  showPatientModal() {
    Radio.request('nav', 'patient', this.patient);
  },
  toggleActiveStatus() {
    this.patient.toggleActiveStatus();
  },
  archivePatient() {
    this.patient.setArchivedStatus();
  },
});
