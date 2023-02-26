import { partial, invoke, defer } from 'underscore';
import Radio from 'backbone.radio';
import Backbone from 'backbone';

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
  routers: [],
  onBeforeStart() {
    // TODO: Preloader content area
    this.getRegion('content').empty();

    if (this.isRestarting()) return;

    new NavApp({ region: this.getRegion('nav') });
    new SidebarService({ region: this.getRegion('sidebar') });

    this.listenTo(Radio.channel('bootstrap'), 'change:workspace', this.restart);
  },
  beforeStart() {
    const currentWorkspace = Radio.request('bootstrap', 'currentWorkspace');
    return [
      Radio.request('entities', 'fetch:states:collection'),
      Radio.request('entities', 'fetch:forms:collection'),
      Radio.request('entities', 'fetch:clinicians:byWorkspace', currentWorkspace.id),
    ];
  },
  onStart() {
    const currentUser = Radio.request('bootstrap', 'currentUser');

    this.startPatientsMain(currentUser);

    if (currentUser.can('dashboards:view')) {
      this.initRouter(DashboardsMainApp);
    }

    if (currentUser.can('clinicians:manage')) {
      this.initRouter(CliniciansMainApp);
    }

    if (currentUser.can('programs:manage')) {
      this.initRouter(ProgramsMainApp);
    }

    this.initFormsApp();

    // Handles the route after the async app-frame start
    defer(() => {
      Backbone.history.loadUrl();
      if (!this.getRegion('content').hasView()) {
        Radio.trigger('event-router', 'notFound');
      }
    });
  },
  onBeforeStop() {
    invoke(this.routers, 'destroy');
    this.routers = [];
  },
  initRouter(RouterApp) {
    const router = new RouterApp({ region: this.getRegion('content') });
    this.routers.push(router);
    return router;
  },
  startPatientsMain(currentUser) {
    if (currentUser.can('app:schedule:reduced')) {
      this.initRouter(ReducedPatientsMainApp);
      return;
    }

    this.initRouter(PatientsMainApp);
  },
  initFormsApp() {
    const formsApp = this.initRouter(FormsApp);

    this.listenTo(formsApp, {
      start: partial(this.toggleNav, false),
      stop: partial(this.toggleNav, true),
    });
  },
  toggleNav(shouldShow) {
    this.getView().toggleNav(!!shouldShow);
  },
});
