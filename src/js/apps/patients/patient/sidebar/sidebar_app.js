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

    this.getRegion('widgets').startPreloader();
  },
  beforeStart({ patient }) {
    const workspacePatient = Radio.request('entities', 'fetch:workspacePatients:byPatient', patient.id);
    const fields = map(Radio.request('bootstrap', 'sidebarWidgets:fields'), fieldName => {
      return Radio.request('entities', 'fetch:patientFields:model', patient.id, fieldName);
    });

    return [workspacePatient, ...fields];
  },
  onStart({ patient }) {
    this.patient = patient;
    const currentUser = Radio.request('bootstrap', 'currentUser');
    this.canManagePatients = currentUser.can('patients:manage');

    this.showSidebar();
  },
  showSidebar() {
    const widgets = Radio.request('bootstrap', 'sidebarWidgets');

    this.showView(new SidebarView({
      model: this.patient,
      collection: widgets,
      canManagePatients: this.canManagePatients,
    }));
  },
  showPatientModal() {
    Radio.request('nav', 'patient', this.patient);
  },
  toggleActiveStatus() {
    this.patient.toggleActiveStatus();
    this.showSidebar();
  },
  archivePatient() {
    this.patient.setArchivedStatus();
    this.showSidebar();
  },
});
