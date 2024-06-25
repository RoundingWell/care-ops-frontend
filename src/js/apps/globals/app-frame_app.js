import { partial, invoke, defer, some } from 'underscore';
import Radio from 'backbone.radio';
import Backbone from 'backbone';

import App from 'js/base/app';

import SidebarService from 'js/services/sidebar';

import NavApp from './nav_app';

export default App.extend({
  routers: [],
  onBeforeStart() {
    this.currentWorkspace = Radio.request('bootstrap', 'currentWorkspace');
    this.getRegion('content').empty();

    if (this.isRestarting()) return;

    new NavApp({ region: this.getRegion('nav') });
    new SidebarService({ region: this.getRegion('sidebar') });

    this.listenTo(Radio.channel('bootstrap'), 'change:workspace', this.restart);

    this.currentUser = Radio.request('bootstrap', 'currentUser');
  },
  beforeStart() {
    const isReduced = this.currentUser.can('app:schedule:reduced');
    const hasDashboards = this.currentUser.can('dashboards:view');
    const hasClinicians = this.currentUser.can('clinicians:manage');
    const hasPrograms = this.currentUser.can('programs:manage');

    return [
      isReduced ? import('js/apps/patients/reduced-patients-main_app.js') : import('js/apps/patients/patients-main_app'),
      hasDashboards ? import('js/apps/dashboards/dashboards-main_app.js') : null,
      hasClinicians ? import('js/apps/clinicians/clinicians-main_app.js') : null,
      hasPrograms ? import('js/apps/programs/programs-main_app.js') : null,
      import('js/apps/forms/forms-main_app'),
      Radio.request('entities', 'fetch:clinicians:byWorkspace', this.currentWorkspace.id),
      Radio.request('entities', 'fetch:directories:filterable'),
      Radio.request('entities', 'fetch:states:collection'),
      Radio.request('entities', 'fetch:forms:collection'),
    ];
  },
  onStart(options, PatientsMainApp, DashboardsMainApp, CliniciansMainApp, ProgramsMainApp, FormsApp, clinicians, directories) {
    Radio.request('bootstrap', 'setDirectories', directories);

    this.currentWorkspace.updateClinicians(clinicians);

    this.initRouter(PatientsMainApp);
    this.initRouter(DashboardsMainApp);
    this.initRouter(CliniciansMainApp);
    this.initRouter(ProgramsMainApp);
    this.initFormsApp(FormsApp);

    // Handles the route after the async app-frame start
    defer(() => {
      Backbone.history.loadUrl();
      if (!some(this.routers, router => router.isRunning())) {
        Radio.trigger('event-router', 'notFound');
      }
    });
  },
  onStop() {
    invoke(this.routers, 'destroy');
    this.routers = [];
  },
  initRouter(RouterAppImport) {
    if (!RouterAppImport) return;

    const RouterApp = RouterAppImport.default;

    const router = new RouterApp({ region: this.getRegion('content') });
    this.routers.push(router);
    return router;
  },
  initFormsApp(FormsApp) {
    const formsApp = this.initRouter(FormsApp);

    this.listenTo(formsApp, {
      start: partial(this.toggleNav, false),
      stop: partial(this.toggleNav, true),
    });
  },
  toggleNav(shouldShow) {
    // NOTE: stops the nav menu from showing when the form page is reloaded
    /* istanbul ignore if: can't test reload */
    if (!this.isRunning()) return;

    this.getView().toggleNav(!!shouldShow);
  },
});
