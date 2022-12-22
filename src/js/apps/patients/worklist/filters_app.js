import Radio from 'backbone.radio';

import intl from 'js/i18n';

import App from 'js/base/app';

import StateModel from './filters_state';

import AllFiltersApp from 'js/apps/patients/sidebar/filters-sidebar_app';

import { FiltersView, GroupsDropList, AllFiltersButtonView } from 'js/views/patients/worklist/filters_views';

const i18n = intl.patients.worklist.filtersApp;

export default App.extend({
  StateModel,
  childApps: {
    allFilters: AllFiltersApp,
  },
  stateEvents: {
    'change:groupId': 'showGroupsFilterView',
  },
  onBeforeStop() {
    this.toggleFiltering(false);
  },
  onStart({ defaultStatesFilter }) {
    const currentClinician = Radio.request('bootstrap', 'currentUser');
    this.canViewAssignedActions = currentClinician.can('app:worklist:clinician_filter');
    this.groups = currentClinician.getGroups();
    this.defaultStatesFilter = defaultStatesFilter;

    this.showView(new FiltersView());
    this.showFilters();
  },
  toggleFiltering(isFiltering) {
    this.isFiltering = isFiltering;
    this.trigger('toggle:filtersSidebar', isFiltering);
  },
  showFilters() {
    this.showAllFiltersButtonView();
    this.showGroupsFilterView();
  },
  showAllFiltersButtonView() {
    const ownerView = this.showChildView('allFilters', new AllFiltersButtonView({ model: this.getState() }));

    this.listenTo(ownerView, 'click', this.showFiltersSidebar);
  },
  showFiltersSidebar() {
    if (this.isFiltering) return;

    this.toggleFiltering(true);

    const state = this.getState();

    const sidebar = Radio.request('sidebar', 'start', 'filters', {
      state: state.attributes,
      defaultStatesFilter: this.defaultStatesFilter,
    });

    const filterState = sidebar.getState();

    sidebar.listenTo(filterState, 'change', (stateModel, { unset }) => {
      unset ? state.clear() : state.set(filterState.attributes);
    });

    sidebar.listenTo(state, 'change', () => {
      filterState.set(state.attributes);
    });

    this.listenTo(sidebar, 'stop', () => {
      this.toggleFiltering(false);
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
      name: i18n.allGroupsName,
    });

    return groups;
  },
});
