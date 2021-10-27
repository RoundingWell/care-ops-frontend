import Radio from 'backbone.radio';

import App from 'js/base/app';

import intl from 'js/i18n';

import { FiltersView, GroupsDropList, OwnerDroplist } from 'js/views/patients/schedule/filters_views';

export default App.extend({
  onStart() {
    this.currentClinician = Radio.request('bootstrap', 'currentUser');
    this.groups = this.currentClinician.getGroups();

    this.showView(new FiltersView());
    this.showFilters();
  },
  showFilters() {
    this.showGroupsFilterView();
    this.showOwnerFilterView();
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
  showOwnerFilterView() {
    const currentClinician = Radio.request('bootstrap', 'currentUser');
    if (!currentClinician.can('view:assigned:actions')) return;

    const owner = Radio.request('entities', 'clinicians:model', this.getState('clinicianId'));

    const ownerFilter = new OwnerDroplist({
      owner,
      groups: this.groups,
      isFilter: true,
      headingText: intl.patients.schedule.filtersApp.ownerFilterHeadingText,
    });

    this.listenTo(ownerFilter, 'change:owner', ({ id }) => {
      this.setState({ clinicianId: id });
    });

    this.showChildView('owner', ownerFilter);
  },
  _getGroups() {
    const groups = this.groups.clone();

    groups.unshift({
      id: null,
      name: intl.patients.schedule.filtersApp.allGroupsName,
    });

    return groups;
  },
});
