import Radio from 'backbone.radio';

import SubRouterApp from 'js/base/subrouterapp';

import intl from 'js/i18n';

import { ListView, LayoutView } from 'js/views/admin/list/clinicians-all_views';

export default SubRouterApp.extend({
  routerAppName: 'CliniciansApp',
  eventRoutes: {
    'clinician': 'showClinicianSidebar',
    'clinician:new': 'showClinicianSidebar',
  },
  viewEvents: {
    'click:addClinician': 'onClickAddClinician',
  },
  onBeforeStart() {
    this.showView(new LayoutView());
    this.getRegion('list').startPreloader();

    this.clinicians = Radio.request('entities', 'clinicians:collection');
  },
  beforeStart() {
    return Radio.request('entities', 'fetch:clinicians:collection');
  },
  onStart({ currentRoute }, collection) {
    this.clinicians.add(collection.models);

    this.showChildView('list', new ListView({ collection: this.clinicians }));

    this.startRoute(currentRoute);
  },
  _getClinician(clinicianId) {
    if (!clinicianId) {
      return Radio.request('entities', 'clinicians:model', {
        access: 'employee',
        enabled: true,
        disabled_at: null,
      });
    }

    return this.clinicians.get(clinicianId);
  },
  showClinicianSidebar(clinicianId) {
    const clinician = this._getClinician(clinicianId);

    if (!clinician) {
      Radio.request('alert', 'show:error', intl.admin.list.cliniciansAllApp.notFound);
      Radio.trigger('event-router', 'clinicians:all');
      return;
    }

    Radio.request('sidebar', 'start', 'clinician', { clinician });

    this.editClinician(clinician);
  },
  editClinician(clinician) {
    if (clinician.isNew()) {
      this.clinicians.unshift(clinician);
      return;
    }

    clinician.trigger('editing', true);
  },
  onClickAddClinician() {
    Radio.trigger('event-router', 'clinician:new');
  },
});
