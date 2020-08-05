import Backbone from 'backbone';
import Radio from 'backbone.radio';

import App from 'js/base/app';

import { SidebarView } from 'js/views/patients/patient/sidebar/sidebar_views';

export default App.extend({
  onBeforeStart({ patient }) {
    const currentOrg = Radio.request('bootstrap', 'currentOrg');

    this.orgEngagementEnabled = currentOrg.getSetting('engagement');
    this.patient = patient;

    const widgets = this.getSidebarWidgets();

    this.showView(new SidebarView({
      model: this.patient,
      collection: widgets,
    }));
  },
  beforeStart({ patient }) {
    return Radio.request('entities', 'fetch:patient:engagementStatus', patient.id);
  },
  onFail() {
    this.patient.trigger('status:notAvailable', true);
  },
  getSidebarWidgets() {
    const collection = new Backbone.Collection([
      { id: '1', widget_type: 'dob', display_name: 'Date of Birth' },
      { id: '2', widget_type: 'sex', display_name: 'Sex' },
      { id: '3', widget_type: 'divider' },
      { id: '4', widget_type: 'engagement', display_name: 'Engagement Status' },
      { id: '5', widget_type: 'divider' },
      { id: '6', widget_type: 'groups', display_name: 'Groups' },
    ]);

    /* TODO: clean this up once widget config is coming from the BE */
    if (!this.orgEngagementEnabled) {
      collection.remove([{ id: '5' }, { id: '6' }]);
    }

    return collection;
  },
});
