import _ from 'underscore';
import Radio from 'backbone.radio';

import SubRouterApp from 'js/base/subrouterapp';

import DashboardApp from 'js/apps/patients/patient/dashboard/dashboard_app';

import { LayoutView } from 'js/views/patients/patient/patient_views';
import { SidebarView } from 'js/views/patients/patient/sidebar/sidebar_views';

export default SubRouterApp.extend({
  eventRoutes() {
    return {
      'patient:dashboard': _.partial(this.startCurrent, 'dashboard'),
    };
  },

  childApps: {
    dashboard: {
      AppClass: DashboardApp,
      regionName: 'content',
    },
  },

  onBeforeStart() {
    this.getRegion().startPreloader();
  },

  beforeStart({ patientId }) {
    return Radio.request('entities', 'fetch:patient:model', patientId);
  },

  onStart({ currentRoute }, patient) {
    this.patient = patient;

    this.setView(new LayoutView());

    this.showSidebar();

    // Show/Empty patient sidebar based on app sidebar
    this.listenTo(Radio.channel('sidebar'), {
      'show': this.emptySidebar,
      'close': this.showSidebar,
    });

    this.startRoute(currentRoute);

    this.showView();
  },

  showSidebar() {
    this.showChildView('sidebar', new SidebarView({ model: this.patient }));
  },

  emptySidebar() {
    this.getRegion('sidebar').empty();
  },
});
