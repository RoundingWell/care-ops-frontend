import { partial } from 'underscore';
import Radio from 'backbone.radio';

import App from 'js/base/app';

import SidebarService from 'js/services/sidebar';

import NavApp from './nav_app';
import FormsApp from 'js/apps/forms/forms-main_app';
import PatientsMainApp from 'js/apps/patients/patients-main_app';
import ReducedPatientsMainApp from 'js/apps/patients/reduced-patients-main_app.js';
import CliniciansMainApp from 'js/apps/clinicians/clinicians-main_app';
import DashboardsMainApp from 'js/apps/dashboards/dashboards-main_app';
import ProgramsMainApp from 'js/apps/programs/programs-main_app';

export default App.extend({
  onStart() {
    const currentUser = Radio.request('bootstrap', 'currentUser');

    new SidebarService({ region: this.getRegion('sidebar') });
    new NavApp({ region: this.getRegion('nav') });

    this.startPatientsMain(currentUser);

    if (currentUser.can('dashboards:view')) {
      new DashboardsMainApp({ region: this.getRegion('content') });
    }

    if (currentUser.can('clinicians:manage')) {
      new CliniciansMainApp({ region: this.getRegion('content') });
    }

    if (currentUser.can('programs:manage')) {
      new ProgramsMainApp({ region: this.getRegion('content') });
    }

    this.initFormsApp();
  },
  startPatientsMain(currentUser) {
    if (currentUser.can('app:schedule:reduced')) {
      new ReducedPatientsMainApp({ region: this.getRegion('content') });
      return;
    }

    new PatientsMainApp({ region: this.getRegion('content') });
  },
  initFormsApp() {
    const formsApp = new FormsApp({ region: this.getRegion('content') });

    this.listenTo(formsApp, {
      start: partial(this.toggleNav, false),
      stop: partial(this.toggleNav, true),
    });
  },
  toggleNav(shouldShow) {
    this.getView().toggleNav(!!shouldShow);
  },
});
