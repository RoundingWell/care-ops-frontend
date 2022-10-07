import Radio from 'backbone.radio';

import App from 'js/base/app';

import intl from 'js/i18n';

import { FiltersView, GroupsDropList } from 'js/views/patients/schedule/filters_views';

export default App.extend({
  onStart() {
    const currentClinician = Radio.request('bootstrap', 'currentUser');
    this.groups = currentClinician.getGroups();

    this.showView(new FiltersView());
    this.showFilters();
  },
  showFilters() {
    this.showGroupsFilterView();
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
  _getGroups() {
    const groups = this.groups.clone();

    groups.unshift({
      id: null,
      name: intl.patients.schedule.filtersApp.allGroupsName,
    });

    return groups;
  },
});
