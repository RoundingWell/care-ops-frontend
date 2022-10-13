import Radio from 'backbone.radio';

import intl from 'js/i18n';

import App from 'js/base/app';

import { FiltersView, GroupsDropList, NoOwnerToggleView } from 'js/views/patients/worklist/filters_views';

const i18n = intl.patients.worklist.filtersApp;

export default App.extend({
  onStart({ shouldShowOwnerToggle }) {
    const currentClinician = Radio.request('bootstrap', 'currentUser');
    this.canViewAssignedActions = currentClinician.can('app:worklist:clinician_filter');
    this.shouldShowOwnerToggle = shouldShowOwnerToggle;
    this.groups = currentClinician.getGroups();

    this.showView(new FiltersView());
    this.showFilters();
  },
  showFilters() {
    this.showGroupsFilterView();
    this.showOwnerToggleView();
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
  showOwnerToggleView() {
    if (!this.shouldShowOwnerToggle || !this.canViewAssignedActions) return;

    const ownerView = this.showChildView('ownerToggle', new NoOwnerToggleView({
      model: this.getState(),
    }));

    this.listenTo(ownerView, 'click', () => {
      this.toggleState('noOwner');
    });
  },
  _getGroups() {
    const groups = this.groups.clone();

    groups.unshift({
      id: null,
      name: i18n.allGroupsName,
    });

    return groups;
  },
});
