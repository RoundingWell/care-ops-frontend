import Radio from 'backbone.radio';

import App from 'js/base/app';

import StateModel from 'js/apps/patients/sidebar/filters_state';

import { LayoutView, HeaderView, CustomFiltersView, StatesFiltersView, groupLabelView } from 'js/views/patients/sidebar/filters/filters-sidebar_views';

export default App.extend({
  StateModel,
  onStart({ availableStates }) {
    const currentOrg = Radio.request('bootstrap', 'currentOrg');
    this.currentClinician = Radio.request('bootstrap', 'currentUser');
    this.directories = currentOrg.getDirectories();
    this.states = currentOrg.getStates();
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
    const groups = this.currentClinician.getGroups();

    if (groups.length > 1) {
      const groupDirectory = collection.unshift({
        name: groupLabelView,
        slug: 'groupId',
      });

      groupDirectory.options = groups;
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
