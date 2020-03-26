import store from 'store';

import Radio from 'backbone.radio';

import App from 'js/base/app';

import FiltersApp from './filters_app';

import { ListView, LayoutView, SortDropList, sortOptions } from 'js/views/patients/worklist/worklist_views';

export default App.extend({
  childApps: {
    filters: {
      AppClass: FiltersApp,
      restartWithParent: false,
      regionName: 'filters',
      getOptions: ['currentClinician'],
    },
  },
  stateEvents: {
    'change': 'onChangeState',
  },
  onChangeState(state) {
    store.set(this.stateId, state);
    if (state.hasChanged('groupId') || state.hasChanged('clinicianId')) {
      this.restart();
    }
  },
  viewEvents: {
    'toggle:listType': 'onToggleListType',
  },
  initListState() {
    this.stateId = `worklist-${ this.worklistId }-${ this.worklistType }`;

    const default_state = {
      sortId: 'sortUpdateDesc',
      groupId: 'all-groups',
      clinicianId: this.currentClinician.id,
    };

    if (!store.get(this.stateId)) {
      store.set(this.stateId, default_state);
      this.setState(default_state);
    } else {
      this.setState(store.get(this.stateId));
    }
  },
  onBeforeStart({ worklistId, worklistType }) {
    if (this.isRestarting()) {
      this.getRegion('list').startPreloader();
      return;
    }

    this.worklistId = worklistId;
    this.worklistType = worklistType;
    this.currentClinician = Radio.request('bootstrap', 'currentUser');
    this.groups = this.currentClinician.getGroups();

    this.initListState();

    this.showView(new LayoutView({
      worklistId: this.worklistId,
      isFlowList: this.worklistType === 'flows',
    }));

    this.getRegion('list').startPreloader();
    this.showSortView();
    this.startFiltersApp();
  },
  beforeStart() {
    let groupId = this.getState('groupId');

    if (groupId === 'all-groups') {
      groupId = this.groups.pluck('id').join(',');
    }

    const filter = this._filtersBy(groupId, this.getState('clinicianId'));
    return Radio.request('entities', `fetch:${ this.worklistType }:collection`, { filter });
  },
  onStart(options, collection) {
    const collectionView = new ListView({
      collection,
      type: this.worklistType,
    });
    collectionView.setComparator(sortOptions.get(this.getState('sortId')).get('comparator'));
    this.showChildView('list', collectionView);
  },
  showSortView() {
    const sortSelect = new SortDropList({
      collection: sortOptions,
      state: { selected: sortOptions.get(this.getState('sortId')) },
    });

    this.listenTo(sortSelect.getState(), 'change:selected', (state, selected) => {
      this.setState('sortId', selected.id);
      this.getChildView('list').setComparator(selected.get('comparator'));
    });

    this.showChildView('sort', sortSelect);
  },
  startFiltersApp() {
    const filtersApp = this.startChildApp('filters', {
      state: this.getState().attributes,
      currentClinician: this.currentClinician,
    });

    this.listenTo(filtersApp.getState(), 'change', state => {
      this.setState(state.attributes);
    });
  },
  onToggleListType(type) {
    Radio.trigger('event-router', `worklist:${ type }`, this.worklistId);
  },
  _filtersBy(groupId, clinicianId) {
    const status = ['queued', 'started'].join(',');

    const filter = { clinician: clinicianId, status, group: groupId };

    return filter;
  },
});
