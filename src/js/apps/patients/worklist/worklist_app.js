import _ from 'underscore';
import moment from 'moment';
import store from 'store';

import Backbone from 'backbone';
import Radio from 'backbone.radio';

import { dateSort } from 'js/utils/sorting';
import intl from 'js/i18n';

import App from 'js/base/app';

import { ListView, LayoutView, GroupsDropList, SortDropList } from 'js/views/patients/worklist/worklist_views';

const i18n = intl.patients.worklist.worklistApp;
const DEFAULT_STATE = {
  sortId: 'sortUpdateDesc',
  groupId: null,
};

const sortOptions = new Backbone.Collection([
  {
    id: 'sortDueAsc',
    text: i18n.sortOptions.sortDueAsc,
    comparator(a, b) {
      if (a.model.get('due_date') === b.model.get('due_date')) {
        return dateSort(
          'asc',
          moment(a.model.get('due_time'), 'HH:mm:ss'),
          moment(b.model.get('due_time'), 'HH:mm:ss'),
        );
      }
      return dateSort('asc', a.model.get('due_date'), b.model.get('due_date'));
    },
  },
  {
    id: 'sortDueDesc',
    text: i18n.sortOptions.sortDueDesc,
    comparator(a, b) {
      if (a.model.get('due_date') === b.model.get('due_date')) {
        return dateSort(
          'desc',
          moment(a.model.get('due_time'), 'HH:mm:ss'),
          moment(b.model.get('due_time'), 'HH:mm:ss'),
        );
      }
      return dateSort('desc', a.model.get('due_date'), b.model.get('due_date'));
    },
  },
  {
    id: 'sortUpdateAsc',
    text: i18n.sortOptions.sortUpdateAsc,
    comparator(a, b) {
      return dateSort('asc', a.model.get('updated_at'), b.model.get('updated_at'));
    },
  },
  {
    id: 'sortUpdateDesc',
    text: i18n.sortOptions.sortUpdateDesc,
    comparator(a, b) {
      return dateSort('desc', a.model.get('updated_at'), b.model.get('updated_at'));
    },
  },
]);

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

    if (this.worklistType === 'actions') {
      return Radio.request('entities', 'fetch:actions:collection', { filter });
    }

    return Radio.request('entities', 'fetch:flows:collection', { filter });
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
      'owned-by-me': { clinician, status },
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
