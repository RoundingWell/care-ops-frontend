import { map } from 'underscore';
import Radio from 'backbone.radio';

import App from 'js/base/app';

import { LayoutView, SidebarWidgetsView } from 'js/views/patients/sidebar/patient/patient-sidebar_views';

export default App.extend({
  onBeforeStart({ patient }) {
    this.showView(new LayoutView({ model: patient }));

    this.getRegion('widgets').startPreloader();
  },
  beforeStart({ patient }) {
    const patientModel = Radio.request('entities', 'fetch:patients:model', patient.id);
    const workspacePatient = Radio.request('entities', 'fetch:workspacePatients:byPatient', patient.id);
    const fields = map(Radio.request('bootstrap', 'sidebarWidgets:fields'), fieldName => {
      return Radio.request('entities', 'fetch:patientFields:model', patient.id, fieldName);
    });

    return [patientModel, workspacePatient, ...fields];
  },
  onStart({ patient }) {
    const widgets = Radio.request('bootstrap', 'sidebarWidgets');

    this.showChildView('widgets', new SidebarWidgetsView({
      model: patient,
      collection: widgets,
    }));
  },
  viewEvents: {
    'close': 'stop',
  },
  onStop() {
    Radio.request('sidebar', 'close');
  },
});
