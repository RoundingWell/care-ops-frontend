import Radio from 'backbone.radio';

import intl from 'js/i18n';

import App from 'js/base/app';

import { FiltersView, GroupsDropList, ClinicianDropList, ClinicianClearButton, TypeToggleView } from 'js/views/patients/worklist/filters_views';

export default App.extend({
  stateEvents: {
    'change:clinicianId': 'showFilters',
  },
  onStart({ shouldShowClinician }) {
    this.shouldShowClinician = shouldShowClinician;
    this.currentClinician = Radio.request('bootstrap', 'currentUser');
    this.groups = this.currentClinician.getGroups();

    this.showView(new FiltersView());
    this.showFilters();
  },
  showFilters() {
    this.showGroupsFilterView();
    this.showTypeToggle();
    if (this.shouldShowClinician) {
      this.showCliniciansFilterView();
      this.showResetButton();
    }
  },
  showGroupsFilterView() {
    if (this.groups.length < 2) return;

    const groups = this._getGroups();
    const selected = groups.get(this.getState('groupId')) || groups.at(0);

    const groupsFilter = new GroupsDropList({
      collection: groups,
      state: { selected },
    });

    this.listenTo(groupsFilter.getState(), 'change:selected', (state, { id }) => {
      this.setState('groupId', id);
    });

    this.showChildView('group', groupsFilter);
  },
  showTypeToggle() {
    const typeToggleView = new TypeToggleView({
      isFlowList: this.getState('type') === 'flows',
    });

    this.listenTo(typeToggleView, 'toggle:listType', type => {
      this.setState('type', type);
    });

    this.showChildView('toggle', typeToggleView);
  },
  showCliniciansFilterView() {
    const selected = Radio.request('entities', 'clinicians:model', this.getState('clinicianId'));

    const clinicianFilter = new ClinicianDropList({
      groups: this.groups,
      state: { selected },
    });

    this.listenTo(clinicianFilter, 'change:selected', ({ id }) => {
      this.setState('clinicianId', id);
    });

    this.showChildView('clinician', clinicianFilter);
  },
  showResetButton() {
    if (this.currentClinician.id === this.getState('clinicianId')) {
      this.getRegion('reset').empty();
      return;
    }

    const clearButton = new ClinicianClearButton();

    this.listenTo(clearButton, 'click', () => {
      this.setState('clinicianId', this.currentClinician.id);
    });

    this.showChildView('reset', clearButton);
  },
  _getGroups() {
    const groups = this.groups.clone();

    groups.unshift({
      id: null,
      name: intl.patients.worklist.filtersApp.allGroupsName,
    });

    return groups;
  },
});
