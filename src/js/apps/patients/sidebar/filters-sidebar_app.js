import Radio from 'backbone.radio';

import App from 'js/base/app';

import StateModel from 'js/apps/patients/sidebar/filters_state';

import { LayoutView, HeaderView, CustomFiltersView, StatesFiltersView } from 'js/views/patients/sidebar/filters/filters-sidebar_views';

export default App.extend({
  StateModel,
  onStart({ availableStates }) {
    const currentWorkspace = Radio.request('bootstrap', 'currentWorkspace');
    this.states = currentWorkspace.getStates();
    this.directories = Radio.request('bootstrap', 'directories');
    this.currentClinician = Radio.request('bootstrap', 'currentUser');
    this.availableStates = availableStates;

    this.showView(new LayoutView({
      model: this.getState(),
    }));

    this.showHeaderView();
    this.showCustomFiltersView();
    this.showStatesFiltersView();
  },
  viewEvents: {
    'close': 'stop',
    'click:clearFilters': 'onClearFilters',
  },
  showHeaderView() {
    const headerView = new HeaderView({ model: this.getState() });

    this.showChildView('header', headerView);
  },
  showCustomFiltersView() {
    const collection = this.directories.clone();

    const customFilters = Radio.request('bootstrap', 'setting', 'custom_filters');

    if (customFilters && customFilters.length) {
      const filteredDirectories = collection.filter(directory => {
        return customFilters.includes(directory.get('slug'));
      });

      collection.reset(filteredDirectories);
    }

    const customFiltersView = new CustomFiltersView({
      collection,
      state: this.getState(),
    });

    this.showChildView('customFilters', customFiltersView);
  },
  showStatesFiltersView() {
    const statesFiltersView = new StatesFiltersView({
      collection: this.availableStates,
      model: this.getState(),
    });

    this.showChildView('statesFilters', statesFiltersView);
  },
  onClearFilters() {
    this.getState().resetState();
  },
  onStop() {
    Radio.request('sidebar', 'close');
  },
});
