import _ from 'underscore';
import moment from 'moment';
import store from 'store';

import Radio from 'backbone.radio';

import App from 'js/base/app';

import { ListView, LayoutView, GroupsDropList, SortDropList, sortOptions } from 'js/views/patients/worklist/worklist_views';

const DEFAULT_STATE = {
  sortId: 'sortUpdateDesc',
  groupId: null,
};

export default App.extend({
  stateEvents: {
    'change': 'onChangeState',
  },
  onChangeState(state) {
    store.set(this.stateId, state);
    if (state.hasChanged('groupId')) {
      this.restart();
    }
  },
  viewEvents: {
    'toggle:listType': 'onToggleListType',
  },
  initListState() {
    this.stateId = `worklist-${ this.worklistId }-${ this.worklistType }`;

    if (!store.get(this.stateId)) {
      store.set(this.stateId, DEFAULT_STATE);
      this.setState(DEFAULT_STATE);
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

    this.initListState();

    this.currentClinician = Radio.request('bootstrap', 'currentUser');
    this.groups = this.currentClinician.getGroups();

    this.showView(new LayoutView({
      worklistId: this.worklistId,
      isFlowList: this.worklistType === 'flows',
    }));
    this.getRegion('list').startPreloader();
    this.showFilterView();
    this.showSortView();
  },
  beforeStart() {
    let groupId = this.getState('groupId');

    if (groupId === 'all-groups') {
      groupId = this.groups.pluck('id').join(',');
    }

    const filter = _.extend({ group: groupId }, this._filtersById(this.worklistId, this.currentClinician));

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
  showFilterView() {
    const groups = this._getGroups();
    const groupId = this.getState('groupId') || groups.at(0).id;
    this.setState({ groupId });

    if (this.groups.length === 1) return;

    const groupsSelect = new GroupsDropList({
      collection: groups,
      state: { selected: groups.get(groupId) },
    });

    this.listenTo(groupsSelect.getState(), 'change:selected', (state, { id }) => {
      this.setState('groupId', id);
    });

    this.showChildView('filters', groupsSelect);
  },
  showSortView() {
    const sortSelect = new SortDropList({
      collection: sortOptions,
      state: { selected: sortOptions.get(this.getState('sortId')) },
      isFlowList: this.worklistType === 'flows',
    });

    this.listenTo(sortSelect.getState(), 'change:selected', (state, selected) => {
      this.setState('sortId', selected.id);
      this.getChildView('list').setComparator(selected.get('comparator'));
    });

    this.showChildView('sort', sortSelect);
  },
  onToggleListType(type) {
    Radio.trigger('event-router', `worklist:${ type }`, this.worklistId);
  },
  _getGroups() {
    const groups = this.groups.clone();

    groups.unshift({
      id: 'all-groups',
      name: 'All Groups',
    });

    return groups;
  },
  _filtersById(worklistId, currentClinician) {
    const clinician = currentClinician.id;
    const role = currentClinician.getRole();
    const status = ['queued', 'started'].join(',');

    const filters = {
      'owned-by': { clinician, status },
      'for-my-role': { role: role.id, status },
      'new-past-day': { created_since: moment().subtract(24, 'hours').format(), status },
      'updated-past-three-days': {
        updated_since: moment().startOf('day').subtract(3, 'days').format(),
        status,
      },
      'done-last-thirty-days': {
        updated_since: moment().startOf('day').subtract(30, 'days').format(),
        status: 'done',
      },
    };

    return filters[worklistId];
  },
});
