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
    'change:searchQuery': 'onChangeSearchQuery',
  },
  onChangeSearchQuery(state) {
    this.currentSearchQuery = state.get('searchQuery');
  },
  initListState() {
    const storedState = this.getState().getStore();

    this.getState().setSearchQuery(this.currentSearchQuery);

    if (storedState) {
      this.setState(storedState);
      return;
    }

    const currentUser = Radio.request('bootstrap', 'currentUser');
    this.setState({ id: `reduced-schedule_${ currentUser.id }` });

    this.getState().setDefaultFilterStates();
  },
  onBeforeStart() {
    if (this.isRestarting()) {
      this.getRegion('count').empty();

      this.getRegion('list').startPreloader();

      return;
    }

    this.initListState();

    this.setView(new LayoutView({
      state: this.getState(),
    }));

    this.showSearchView();
    this.showTableHeaders();
    this.showScheduleTitle();
    this.startFiltersApp();

    this.getRegion('list').startPreloader();

    this.showView();
  },
  onBeforeStop() {
    this.collection = null;
  },
  beforeStart() {
    const filter = this.getState().getEntityFilter();
    return Radio.request('entities', 'fetch:actions:collection', { filter });
  },
  onStart(options, collection) {
    this.collection = collection;
    this.filteredCollection = collection.clone();

    this.listenTo(this.filteredCollection, 'reset', this.showCountView);
    this.showCountView();

    this.showList();
  },
  showList() {
    const scheduleListView = new ScheduleListView({
      collection: this.collection.groupByDate(),
      state: this.getState(),
    });

    this.listenTo(scheduleListView, 'filtered', filtered => {
      this.filteredCollection.reset(filtered);
    });

    this.showChildView('list', scheduleListView);
  },
  startFiltersApp() {
    const filtersApp = this.startChildApp('filters', {
      state: this.getState().getFiltersState(),
      availableStates: this.getState().getAvailableStates(),
    });

    const filtersState = filtersApp.getState();
    this.listenTo(filtersState, 'change', () => {
      this.setState(filtersState.getFiltersState());
    });
  },
  showCountView() {
    const countView = new CountView({
      collection: this.collection,
      filteredCollection: this.filteredCollection,
    });

    this.showChildView('count', countView);
  },
  showTableHeaders() {
    const tableHeadersView = new TableHeaderView();

    this.showChildView('table', tableHeadersView);
  },
  showScheduleTitle() {
    this.showChildView('title', new ScheduleTitleView({
      model: this.getState(),
    }));
  },
  showSearchView() {
    const searchComponent = new SearchComponent({
      state: {
        query: this.getState('searchQuery'),
      },
    });

    this.listenTo(searchComponent.getState(), 'change:query', (state, searchQuery) => {
      this.getState().setSearchQuery(searchQuery);
    });

    this.showChildView('search', searchComponent);
  },
});
