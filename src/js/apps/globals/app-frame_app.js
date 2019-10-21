import _ from 'underscore';

import App from 'js/base/app';

import SidebarService from 'js/services/sidebar';

import NavApp from './nav_app';
import FormsApp from 'js/apps/forms/forms-main_app';
import PatientsMainApp from 'js/apps/patients/patients-main_app';
import AdminMainApp from 'js/apps/admin/admin-main_app';

export default App.extend({
  onStart() {
    new SidebarService({ region: this.getRegion('sidebar') });
    new NavApp({ region: this.getRegion('nav') });
    new PatientsMainApp({ region: this.getRegion('content') });
    new AdminMainApp({ region: this.getRegion('content') });

    this.initFormsApp();
  },
  initFormsApp() {
    const formsApp = new FormsApp({ region: this.getRegion('content') });

    this.listenTo(formsApp, {
      start: _.partial(this.toggleNav, false),
      stop: _.partial(this.toggleNav, true),
    });
  },
  toggleNav(shouldShow) {
    this.getView().toggleNav(!!shouldShow);
  },
});
