import Radio from 'backbone.radio';

import App from 'js/base/app';

import intl from 'js/i18n';

import AllFiltersApp from 'js/apps/patients/sidebar/filters-sidebar_app';

import { FiltersView, AllFiltersButtonView, GroupsDropList } from 'js/views/patients/schedule/filters_views';

export default App.extend({
  childApps: {
    allFilters: AllFiltersApp,
  },
  stateEvents: {
    'change:groupId': 'showGroupsFilterView',
  },
  onStart() {
    const currentClinician = Radio.request('bootstrap', 'currentUser');
    this.groups = currentClinician.getGroups();

    this.showView(new FiltersView());
    this.showFilters();
  },
  showFilters() {
    this.showAllFiltersButtonView();
    this.showGroupsFilterView();
  },
  showAllFiltersButtonView() {
    const directories = Radio.request('bootstrap', 'currentOrg:directories');

    if (!directories.length) return;

    const ownerView = this.showChildView('allFilters', new AllFiltersButtonView());

    this.listenTo(ownerView, 'click', this.showGroupSidebar);
  },
  showGroupSidebar() {
    this.trigger('toggle:filtersSidebar', true);

    const state = this.getState();

    const sidebar = Radio.request('sidebar', 'start', 'filters', {
      state: state.attributes,
    });

    const filterState = sidebar.getState();

    this.listenTo(filterState, 'change', () => {
      this.setState(filterState.attributes);
    });

    sidebar.listenTo(this.getState(), 'change', () => {
      sidebar.setState(state.attributes);
    });

    this.listenTo(sidebar, 'stop', () => {
      this.trigger('toggle:filtersSidebar', false);
    });

    this.listenTo(sidebar, 'reset:filters:state', () => {
      this.trigger('reset:filters:state');
    });
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
