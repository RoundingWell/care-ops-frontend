import Radio from 'backbone.radio';

import App from 'js/base/app';

import StateModel from 'js/apps/patients/sidebar/filters_state';

import AllFiltersApp from 'js/apps/patients/sidebar/filters-sidebar_app';

import { AllFiltersButtonView } from 'js/views/patients/worklist/worklist_views';

export default App.extend({
  StateModel,
  childApps: {
    allFilters: AllFiltersApp,
  },
  onBeforeStop() {
    this.toggleFiltering(false);
  },
  onStart({ availableStates }) {
    const currentClinician = Radio.request('bootstrap', 'currentUser');
    this.canViewAssignedActions = currentClinician.can('app:worklist:clinician_filter');
    this.availableStates = availableStates;

    const allFiltersButtonView = this.showView(new AllFiltersButtonView({
      model: this.getState(),
    }));

    this.listenTo(allFiltersButtonView, 'click', this.showFiltersSidebar);
  },
  toggleFiltering(isFiltering) {
    this.isFiltering = isFiltering;
    this.trigger('toggle:filtersSidebar', isFiltering);
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
});
