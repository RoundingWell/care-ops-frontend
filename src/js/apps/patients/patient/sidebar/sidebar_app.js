import Radio from 'backbone.radio';

import collectionOf from 'js/utils/formatting/collection-of';
import App from 'js/base/app';

import { SidebarView } from 'js/views/patients/patient/sidebar/sidebar_views';

export default App.extend({
  onBeforeStart({ patient }) {
    const currentOrg = Radio.request('bootstrap', 'currentOrg');
    const widgets = Radio.request('entities', 'widgets:collection', collectionOf(currentOrg.getSetting('widget_sidebar'), 'id'));
    this.patient = patient;

    this.showView(new SidebarView({
      model: patient,
      collection: widgets,
    }));
  },
});
