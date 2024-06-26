import Radio from 'backbone.radio';

import App from 'js/base/app';

import { LayoutView, HeaderView, CustomFiltersView, StatesFiltersView, FlowStatesFiltersView } from 'js/views/patients/sidebar/filters/filters-sidebar_views';

export default App.extend({
  onStart({ filtersState }) {
    this.filtersState = filtersState;

    this.setView(new LayoutView());

    this.showHeaderView();
    this.showCustomFiltersView();
    this.showStatesFiltersView();
    this.showFlowStatesFiltersView();

    this.listenTo(filtersState, 'change:listType', this.showFlowStatesFiltersView);

    this.showView();
  },
  viewEvents: {
    'close': 'stop',
    'click:clearFilters': 'onClearFilters',
  },
  showHeaderView() {
    const headerView = new HeaderView({ model: this.filtersState });

    this.showChildView('header', headerView);
  },
  showCustomFiltersView() {
    const collection = Radio.request('bootstrap', 'directories');

    const customFilters = Radio.request('settings', 'get', 'custom_filters');

    if (customFilters && customFilters.length) {
      const filteredDirectories = collection.filter(directory => {
        return customFilters.includes(directory.get('slug'));
      });

      collection.reset(filteredDirectories);
    }

    const customFiltersView = new CustomFiltersView({
      collection,
      state: this.filtersState,
    });

    this.showChildView('customFilters', customFiltersView);
  },
  showFlowStatesFiltersView() {
    // Filters actions by their flow's state
    if (this.filtersState.isFlowType()) {
      this.getRegion('flowStatesFilters').empty();
      return;
    }

    const currentWorkspace = Radio.request('bootstrap', 'currentWorkspace');
    const states = currentWorkspace.getStates();

    const flowStatesFiltersView = new FlowStatesFiltersView({
      collection: states,
      model: this.filtersState,
    });

    this.showChildView('flowStatesFilters', flowStatesFiltersView);
  },
  showStatesFiltersView() {
    const statesFiltersView = new StatesFiltersView({
      collection: this.filtersState.getAvailableStates(),
      model: this.filtersState,
    });

    this.showChildView('statesFilters', statesFiltersView);
  },
  onClearFilters() {
    this.filtersState.setDefaultFilterStates();
  },
  onStop() {
    Radio.request('sidebar', 'close');
  },
});
