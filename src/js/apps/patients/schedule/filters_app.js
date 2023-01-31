import Radio from 'backbone.radio';

import App from 'js/base/app';

import intl from 'js/i18n';

import StateModel from 'js/apps/patients/sidebar/filters_state';
import AllFiltersApp from 'js/apps/patients/sidebar/filters-sidebar_app';

import { FiltersView, AllFiltersButtonView, WorkspacesDropList } from 'js/views/patients/schedule/filters_views';

export default App.extend({
  StateModel,
  childApps: {
    allFilters: AllFiltersApp,
  },
  stateEvents: {
    'change:filters': 'showWorkspacesFilterView',
  },
  onBeforeStop() {
    this.toggleFiltering(false);
  },
  onStart({ availableStates }) {
    const currentClinician = Radio.request('bootstrap', 'currentUser');
    this.workspaces = currentClinician.getWorkspaces();
    this.availableStates = availableStates;

    this.showView(new FiltersView());
    this.showFilters();
  },
  toggleFiltering(isFiltering) {
    this.isFiltering = isFiltering;
    this.trigger('toggle:filtersSidebar', isFiltering);
  },
  showFilters() {
    this.showAllFiltersButtonView();
    this.showWorkspacesFilterView();
  },
  showAllFiltersButtonView() {
    const ownerView = this.showChildView('allFilters', new AllFiltersButtonView({
      model: this.getState(),
    }));

    this.listenTo(ownerView, 'click', this.showFiltersSidebar);
  },
  showFiltersSidebar() {
    if (this.isFiltering) return;

    this.toggleFiltering(true);

    const state = this.getState();

    const sidebar = Radio.request('sidebar', 'start', 'filters', {
      state: state.attributes,
      availableStates: this.availableStates,
    });

    const filterState = sidebar.getState();

    sidebar.listenTo(filterState, 'change', stateModel => {
      state.set(filterState.attributes);
    });

    sidebar.listenTo(state, 'change', () => {
      filterState.set(state.attributes);
    });

    this.listenTo(sidebar, 'stop', () => {
      this.toggleFiltering(false);
    });
  },
  showWorkspacesFilterView() {
    if (this.workspaces.length < 2) return;

    const workspaces = this._getWorkspaces();
    const selected = workspaces.get(this.getState().getFilter('workspaceId')) || workspaces.at(0);

    const workspacesFilter = new WorkspacesDropList({
      collection: workspaces,
      state: { selected },
    });

    this.listenTo(workspacesFilter.getState(), 'change:selected', (state, { id }) => {
      this.getState().setFilter('workspaceId', id);
    });

    this.showChildView('workspace', workspacesFilter);
  },
  _getWorkspaces() {
    const workspaces = this.workspaces.clone();

    workspaces.unshift({
      id: null,
      name: intl.patients.schedule.filtersApp.allWorkspacesName,
    });

    return workspaces;
  },
});
