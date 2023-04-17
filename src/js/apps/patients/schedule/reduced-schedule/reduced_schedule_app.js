import Radio from 'backbone.radio';

import App from 'js/base/app';

import StateModel from './reduced_schedule_state';

import FiltersApp from 'js/apps/patients/schedule/filters_app';

import SearchComponent from 'js/views/shared/components/list-search';

import { CountView } from 'js/views/patients/shared/list_views';

import { LayoutView, ScheduleTitleView, TableHeaderView, ScheduleListView } from 'js/views/patients/schedule/schedule_views';

export default App.extend({
  StateModel,
  childApps: {
    filters: {
      AppClass: FiltersApp,
      regionName: 'filters',
      restartWithParent: false,
      getOptions: ['currentClinician'],
    },
  },
  stateEvents: {
    'change:filters change:states': 'restart',
  },
  initListState() {
    const storedState = this.getState().getStore();

    if (storedState) {
      this.setState(storedState);

      return;
    }

    const currentUser = Radio.request('bootstrap', 'currentUser');
    this.setState({ id: `reduced-schedule_${ currentUser.id }` });

    this.getState().setDefaultFilterStates();
  },
  onBeforeStop() {
    this.collection = null;
  },
  onBeforeStart() {
    if (this.isRestarting()) {
      this.getRegion('list').startPreloader();

      this.getRegion('count').empty();

      return;
    }

    this.initListState();

    this.showView(new LayoutView({
      state: this.getState(),
    }));

    this.getRegion('list').startPreloader();

    this.showScheduleTitle();
    this.showSearchView();
    this.startFiltersApp();
    this.showTableHeaders();
  },
  beforeStart() {
    const filter = this.getState().getEntityFilter();
    return Radio.request('entities', 'fetch:actions:collection', { filter });
  },
  onStart(options, collection) {
    this.collection = collection;
    this.filteredCollection = collection.clone();

    this.showScheduleList();
    this.showSearchView();
    this.showCountView();
  },
  showScheduleList() {
    const collectionView = new ScheduleListView({
      collection: this.collection.groupByDate(),
      state: this.getState(),
    });

    this.listenTo(collectionView, 'filtered', filtered => {
      this.filteredCollection.reset(filtered);
      this.showCountView();
    });

    this.showChildView('list', collectionView);
  },
  showScheduleTitle() {
    const currentClinician = Radio.request('bootstrap', 'currentUser');
    const owner = Radio.request('entities', 'clinicians:model', currentClinician.id);

    this.showChildView('title', new ScheduleTitleView({
      model: owner,
    }));
  },
  showSearchView() {
    const searchComponent = this.showChildView('search', new SearchComponent({
      state: {
        query: this.getState('searchQuery'),
        isDisabled: !this.collection || !this.collection.length,
      },
    }));

    this.listenTo(searchComponent.getState(), 'change:query', this.setSearchState);
  },
  startFiltersApp() {
    const state = this.getState();
    const filtersApp = this.startChildApp('filters', {
      state: state.getFiltersState(),
      availableStates: state.getAvailableStates(),
    });

    const filtersState = filtersApp.getState();
    this.listenTo(filtersState, 'change', () => {
      this.setState(filtersState.getFiltersState());
    });
  },
  showTableHeaders() {
    const tableHeadersView = new TableHeaderView();

    this.showChildView('table', tableHeadersView);
  },
  showCountView() {
    const countView = new CountView({
      collection: this.collection,
      filteredCollection: this.filteredCollection,
    });

    this.showChildView('count', countView);
  },
  setSearchState(state, searchQuery) {
    this.setState({
      searchQuery: searchQuery.length > 2 ? searchQuery : '',
    });
  },
});
