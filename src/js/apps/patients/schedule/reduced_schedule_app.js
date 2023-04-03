import Radio from 'backbone.radio';

import App from 'js/base/app';

import SearchComponent from 'js/views/shared/components/list-search';

import { LayoutView, ScheduleTitleView, TableHeaderView, ScheduleListView } from 'js/views/patients/schedule/schedule_views';

export default App.extend({
  onBeforeStop() {
    this.collection = null;
  },
  onBeforeStart() {
    this.setState({ isReduced: true });

    this.showView(new LayoutView({
      state: this.getState(),
    }));

    this.getRegion('list').startPreloader();

    this.showScheduleTitle();
    this.showSearchView();
    this.showTableHeaders();
  },
  beforeStart() {
    const currentClinician = Radio.request('bootstrap', 'currentUser');

    const currentWorkspace = Radio.request('bootstrap', 'currentWorkspace');
    const states = currentWorkspace.getStates();

    const filter = {
      clinician: currentClinician.id,
      state: states.groupByDone().notDone.getFilterIds(),
    };

    return Radio.request('entities', 'fetch:actions:collection', { filter });
  },
  onStart(options, collection) {
    this.collection = collection;

    this.showScheduleList();
    this.showSearchView();
  },
  showScheduleList() {
    const collectionView = new ScheduleListView({
      collection: this.collection.groupByDate(),
      state: this.getState(),
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
  showTableHeaders() {
    const tableHeadersView = new TableHeaderView();

    this.showChildView('table', tableHeadersView);
  },
  setSearchState(state, searchQuery) {
    this.setState({
      searchQuery: searchQuery.length > 2 ? searchQuery : '',
    });
  },
});
