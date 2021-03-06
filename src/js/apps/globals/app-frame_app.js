import { partial } from 'underscore';
import Radio from 'backbone.radio';

import App from 'js/base/app';

import SidebarService from 'js/services/sidebar';

import NavApp from './nav_app';
import FormsApp from 'js/apps/forms/forms-main_app';
import CheckInsApp from 'js/apps/check-ins/check-ins-main_app';
import PatientsMainApp from 'js/apps/patients/patients-main_app';
import AdminMainApp from 'js/apps/admin/admin-main_app';

export default App.extend({
  onStart() {
    const currentUser = Radio.request('bootstrap', 'currentUser');

    new SidebarService({ region: this.getRegion('sidebar') });
    new NavApp({ region: this.getRegion('nav') });
    new PatientsMainApp({ region: this.getRegion('content') });

    if (currentUser.can('admin')) new AdminMainApp({ region: this.getRegion('content') });

    this.initFormsApp();
    this.initCheckInsApp();
  },
  initFormsApp() {
    const formsApp = new FormsApp({ region: this.getRegion('content') });

    this.listenTo(formsApp, {
      start: partial(this.toggleNav, false),
      stop: partial(this.toggleNav, true),
    });
  },
  initCheckInsApp() {
    const checkInsApp = new CheckInsApp({ region: this.getRegion('content') });

    this.listenTo(checkInsApp, {
      start: partial(this.toggleNav, false),
      stop: partial(this.toggleNav, true),
    });
  },
  toggleNav(shouldShow) {
    this.getView().toggleNav(!!shouldShow);
  },
});
