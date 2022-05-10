import Radio from 'backbone.radio';

import SubRouterApp from 'js/base/subrouterapp';

import intl from 'js/i18n';

import SearchComponent from 'js/views/shared/components/list-search';

import { ListView, LayoutView } from 'js/views/clinicians/clinicians-all_views';

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

    this.showSearchView();

    this.clinicians = Radio.request('entities', 'clinicians:collection');
  },
  beforeStart() {
    return Radio.request('entities', 'fetch:clinicians:collection');
  },
  onStart({ currentRoute }, collection) {
    this.collection = collection;

    this.clinicians.add(collection.models);

    this.showChildView('list', new ListView({
      collection: this.clinicians,
      state: this.getState(),
    }));

    this.showSearchView();

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
  showSearchView() {
    const searchComponent = this.showChildView('search', new SearchComponent({
      state: {
        query: this.getState('searchQuery'),
        isDisabled: !this.collection || !this.collection.length,
      },
    }));

    this.listenTo(searchComponent.getState(), 'change:query', this.setSearchState);
  },
  setSearchState(state, searchQuery) {
    this.setState({
      searchQuery: searchQuery.length > 2 ? searchQuery : '',
    });
  },
  showClinicianSidebar(clinicianId) {
    const clinician = this._getClinician(clinicianId);

    if (!clinician) {
      Radio.request('alert', 'show:error', intl.clinicians.cliniciansAllApp.notFound);
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
