import Radio from 'backbone.radio';

import App from 'js/base/app';

import { FiltersView, GroupsDropList, ClinicianDropList, ClinicianClearButton } from 'js/views/patients/worklist/worklist_views';

export default App.extend({
  stateEvents: {
    'change:clinicianId': 'showFilters',
  },
  onStart(options) {
    this.currentClinician = options.currentClinician;
    this.groups = this.currentClinician.getGroups();

    this.showView(new FiltersView({
      model: this.currentClinician,
    }));
    this.showFilters();
  },
  showFilters() {
    this.showGroupsFilterView();
    this.showCliniciansFilterView();
    this.showResetButton();
  },
  showGroupsFilterView() {
    const groups = this._getGroups();
    if (groups.length <= 2) return;

    const groupsSelect = new GroupsDropList({
      collection: groups,
      state: { selected: groups.get(this.getState('groupId')) },
    });

    this.listenTo(groupsSelect.getState(), 'change:selected', (state, { id }) => {
      this.setState('groupId', id);
    });

    this.showChildView('group', groupsSelect);
  },
  showCliniciansFilterView() {
    const selected = Radio.request('entities', 'clinicians:model', this.getState('clinicianId'));

    const clinicianFilter = new ClinicianDropList({
      model: this.currentClinician,
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
      id: 'all-groups',
      name: 'All Groups',
    });

    return groups;
  },
});
