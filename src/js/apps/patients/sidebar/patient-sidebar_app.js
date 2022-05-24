import { map } from 'underscore';
import Radio from 'backbone.radio';

import App from 'js/base/app';

import { LayoutView } from 'js/views/patients/sidebar/patient/patient-sidebar_views';
import { WidgetCollectionView } from 'js/views/patients/widgets/widgets_views';

export default App.extend({
  onBeforeStart({ patient }) {
    this.showView(new LayoutView({ model: patient }));
  },
  beforeStart({ patient }) {
    const patientModel = Radio.request('entities', 'fetch:patients:model', patient.id);
    const fields = map(Radio.request('bootstrap', 'sidebarWidgets:fields'), fieldName => {
      return Radio.request('entities', 'fetch:patientFields:model', patient.id, fieldName);
    });

    return [patientModel, ...fields];
  },
  onStart({ patient }) {
    const widgets = Radio.request('bootstrap', 'sidebarWidgets');

    this.showChildView('widgets', new WidgetCollectionView({
      model: patient,
      collection: widgets,
      itemClassName: 'patient-sidebar__section',
    }));
  },
  viewEvents: {
    'close': 'stop',
  },
  onStop() {
    Radio.request('sidebar', 'close');
  },
});
