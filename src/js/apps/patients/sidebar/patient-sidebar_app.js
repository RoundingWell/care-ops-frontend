import { map } from 'underscore';
import Radio from 'backbone.radio';

import App from 'js/base/app';

import { LayoutView } from 'js/views/patients/sidebar/patient/patient-sidebar_views';

export default App.extend({
  beforeStart({ patient }) {
    const patientModel = Radio.request('entities', 'fetch:patients:model', patient.id);
    const fields = map(Radio.request('bootstrap', 'sidebarWidgets:fields'), fieldName => {
      return Radio.request('entities', 'fetch:patientFields:model', patient.id, fieldName);
    });

    return [patientModel, fields];
  },
  onStart({ patient }, [patientModel]) {
    const widgets = Radio.request('bootstrap', 'sidebarWidgets');

    this.showView(new LayoutView({ patient: patientModel, widgets }));
  },
  viewEvents: {
    'close': 'stop',
  },
  onStop() {
    Radio.request('sidebar', 'close');
  },
});
