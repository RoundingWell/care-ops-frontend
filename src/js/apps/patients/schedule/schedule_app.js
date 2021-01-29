import { clone, extend } from 'underscore';
import Radio from 'backbone.radio';
import store from 'store';

import App from 'js/base/app';

import StateModel from './schedule_state';

import FiltersApp from './filters_app';

import DateFilterComponent from 'js/views/patients/shared/components/date-filter';
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
    'change:filters change:dateFilters': 'restart',
  },
  initListState() {
    const currentUser = Radio.request('bootstrap', 'currentUser');
    const storedState = store.get(`schedule_${ currentUser.id }`);
    const filters = this.getState('filters');

    // NOTE: Allows for new defaults to get added to stored filters
    if (storedState) storedState.filters = extend({}, filters, storedState.filters);

    this.setState(extend({ id: `schedule_${ currentUser.id }` }, storedState));
  },
  onBeforeStart() {
    if (this.isRestarting()) {
      this.showScheduleTitle();
      this.getRegion('list').startPreloader();
      return;
    }

    this.initListState();
    this.showView(new LayoutView({
      state: this.getState(),
    }));

    this.getRegion('list').startPreloader();

    this.showScheduleTitle();
    this.startFiltersApp();
    this.showDateFilter();
    this.showTableHeaders();
  },
  beforeStart() {
    const filter = this.getState().getEntityFilter();
    return Radio.request('entities', 'fetch:actions:collection:groupByDate', { filter });
  },
  onStart(options, collection) {
    const collectionView = new ScheduleListView({
      collection,
      state: this.getState(),
    });

    this.showChildView('list', collectionView);
  },
  showScheduleTitle() {
    const filters = this.getState().get('filters');
    const owner = Radio.request('entities', 'clinicians:model', filters.clinicianId);

    this.showChildView('title', new ScheduleTitleView({
      model: owner,
    }));
  },
  startFiltersApp() {
    const filtersApp = this.startChildApp('filters', {
      state: this.getState().getFilters(),
    });

    this.listenTo(filtersApp.getState(), 'change', ({ attributes }) => {
      this.setState({ filters: clone(attributes) });
    });
  },
  showDateFilter() {
    const dateTypes = ['due_date'];

    const dateFilterComponent = new DateFilterComponent({
      dateTypes,
      state: this.getState().getDateFilters(),
      region: this.getRegion('dateFilter'),
    });

    this.listenTo(dateFilterComponent.getState(), {
      'change'({ attributes }) {
        this.setState({ dateFilters: clone(attributes) });
      },
    });

    dateFilterComponent.show();
  },
  showTableHeaders() {
    const tableHeadersView = new TableHeaderView();

    this.showChildView('table', tableHeadersView);
  },
});
