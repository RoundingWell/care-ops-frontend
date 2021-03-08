import Radio from 'backbone.radio';

import collectionOf from 'js/utils/formatting/collection-of';
import App from 'js/base/app';

import intl from 'js/i18n';

import { PatientModal } from 'js/views/globals/patient-modal/patient-modal_views';
import { SidebarView } from 'js/views/patients/patient/sidebar/sidebar_views';

export default App.extend({
  onBeforeStart({ patient }) {
    const currentOrg = Radio.request('bootstrap', 'currentOrg');
    const widgets = Radio.request('entities', 'widgets:collection', collectionOf(currentOrg.getSetting('widget_sidebar'), 'id'));

    this.patient = patient;

    const sidebarView = this.showView(new SidebarView({
      model: this.patient,
      collection: widgets,
    }));

    this.listenTo(sidebarView, 'click:accountDetails', this.showPatientModal);
  },
  showPatientModal() {
    const patientModalView = new PatientModal({
      patient: this.patient,
    });

    const patientModal = Radio.request('modal', 'show:custom', patientModalView);

    this.listenTo(patientModal, {
      'save'({ model }) {
        this.patient.saveAll(model.attributes)
          .then(({ data }) => {
            Radio.request('alert', 'show:success', intl.patients.patient.sidebar.sidebarApp.patientUpdateSuccess);
            patientModal.destroy();
          })
          .fail(({ responseJSON }) => {
            // This assumes that only the similar patient error is handled on the server
            patientModal.setState({
              backend_errors: {
                name: responseJSON.errors[0].detail,
              },
            });
          });
      },
    });
  },
});
