import { clone, extend, keys, omit, reduce, filter, contains, sortBy } from 'underscore';
import dayjs from 'dayjs';
import store from 'store';
import { NIL as NIL_UUID } from 'uuid';

import Backbone from 'backbone';
import Radio from 'backbone.radio';

import { RELATIVE_DATE_RANGES } from 'js/static';

const STATE_VERSION = 'v5';

const relativeRanges = new Backbone.Collection(RELATIVE_DATE_RANGES);

export default Backbone.Model.extend({
  defaults() {
    return {
      actionsSortId: 'sortCreatedDesc',
      flowsSortId: 'sortCreatedDesc',
      actionsDateFilters: {
        dateType: 'created_at',
        selectedDate: null,
        selectedMonth: null,
        selectedWeek: null,
        relativeDate: null,
      },
      flowsDateFilters: {
        dateType: 'created_at',
        selectedDate: null,
        selectedMonth: null,
        selectedWeek: null,
        relativeDate: null,
      },
      isFiltering: false,
      filters: {},
      states: [],
      clinicianId: this.currentClinician.id,
      teamId: this.currentClinician.getTeam().id,
      noOwner: false,
      lastSelectedIndex: null,
      actionsSelected: {},
      flowsSelected: {},
      searchQuery: '',
      listType: 'actions',
    };
  },
  preinitialize() {
    this.currentWorkspace = Radio.request('bootstrap', 'currentWorkspace');
    this.states = this.currentWorkspace.getStates();
    this.currentClinician = Radio.request('bootstrap', 'currentUser');
  },
  initialize() {
    this.on('change', this.onChange);
  },
  getStoreKey(id) {
    return `${ id }_${ this.currentClinician.id }_${ this.currentWorkspace.id }-${ STATE_VERSION }`;
  },
  getStore(id) {
    return store.get(this.getStoreKey(id));
  },
  onChange() {
    store.set(this.getStoreKey(this.id), omit(this.attributes, 'isFiltering', 'lastSelectedIndex', 'searchQuery'));
  },
  setDateFilters(filters) {
    return this.set(`${ this.getType() }DateFilters`, clone(filters));
  },
  getDateFilters() {
    return clone(this.get(`${ this.getType() }DateFilters`));
  },
  getFilters() {
    return clone(this.get('filters'));
  },
  getStatesFilters() {
    return clone(this.get('states'));
  },
  setSearchQuery(searchQuery = '') {
    return this.set({
      searchQuery: searchQuery.length > 2 ? searchQuery : '',
      lastSelectedIndex: null,
    });
  },
  getType() {
    return this.get('listType');
  },
  setType(listType) {
    return this.set({
      listType,
      lastSelectedIndex: null,
    });
  },
  isFlowType() {
    return this.getType() === 'flows';
  },
  getSort() {
    return this.get(`${ this.getType() }SortId`);
  },
  setSort(sortId) {
    this.set(`${ this.getType() }SortId`, sortId);
  },
  isDoneOnly() {
    return this.id === 'done-last-thirty-days';
  },
  getAvailableStates() {
    const onlyDoneStates = this.states.groupByDone().done;

    return this.isDoneOnly() ? onlyDoneStates : this.states;
  },
  getDefaultSelectedStates() {
    const { done, notDone } = this.states.groupByDone();

    const states = this.isDoneOnly() ? done : notDone;
    return sortBy(states.map('id'));
  },
  setDefaultFilterStates() {
    this.set({ filters: {}, states: this.getDefaultSelectedStates() });
  },
  getFiltersState() {
    return {
      filters: this.getFilters(),
      states: this.getStatesFilters(),
      defaultStates: this.getDefaultSelectedStates(),
    };
  },
  formatDateRange(dateType, date, rangeType) {
    const dateFormat = (dateType === 'due_date') ? 'YYYY-MM-DD' : '';
    return `${ dayjs(date).startOf(rangeType).format(dateFormat) },${ dayjs(date).endOf(rangeType).format(dateFormat) }`;
  },
  getDateRange({ dateType, selectedDate, selectedMonth, selectedWeek, relativeDate }) {
    if (selectedDate) return this.formatDateRange(dateType, selectedDate, 'day');

    if (selectedMonth) return this.formatDateRange(dateType, selectedMonth, 'month');

    if (selectedWeek) return this.formatDateRange(dateType, selectedWeek, 'week');

    relativeDate = relativeDate || 'thismonth';
    const { prev, unit } = relativeRanges.get(relativeDate).pick('prev', 'unit');
    const relativeRange = dayjs().subtract(prev, unit);

    return this.formatDateRange(dateType, relativeRange, unit);
  },
  getStaticDateFilter() {
    const staticDateFilters = {
      'new-past-day': {
        created_at: dayjs().subtract(24, 'hours').format(),
      },
      'updated-past-three-days': {
        updated_at: dayjs().startOf('day').subtract(3, 'days').format(),
      },
      'done-last-thirty-days': {
        updated_at: dayjs().startOf('day').subtract(30, 'days').format(),
      },
    };

    return staticDateFilters[this.id];
  },
  getEntityDateFilter() {
    const staticDateFilter = this.getStaticDateFilter();
    if (staticDateFilter) return staticDateFilter;

    const dateFilters = this.getDateFilters();
    if (dateFilters.relativeDate === 'alltime') return {};

    return {
      [dateFilters.dateType]: this.getDateRange(dateFilters),
    };
  },
  getEntityStatesFilter() {
    const availableStateFilterIds = this.getAvailableStates().map('id');
    const selectedStates = this.getStatesFilters();

    return { state: filter(selectedStates, id => contains(availableStateFilterIds, id)).join() || NIL_UUID };
  },
  getOwner() {
    const clinician = this.get('clinicianId');

    if (clinician) return Radio.request('entities', 'clinicians:model', clinician);

    return Radio.request('entities', 'teams:model', this.get('teamId'));
  },
  getEntityOwnerFilter() {
    const clinician = this.get('clinicianId');

    if (this.id === 'shared-by' || !clinician) {
      const team = this.get('teamId');
      const noOwner = this.get('noOwner');
      const canFilterClinicians = this.currentClinician.can('app:worklist:clinician_filter');

      if (noOwner || !canFilterClinicians) return { team, clinician: NIL_UUID };

      return { team };
    }

    return { clinician };
  },
  getEntityCustomFilter() {
    const filtersState = this.getFilters();
    return reduce(filtersState, (filters, selected, slug) => {
      if (selected !== null) filters[`@${ slug }`] = selected;

      return filters;
    }, {});
  },
  getEntityFilter() {
    const filters = {};

    extend(filters, this.getEntityDateFilter());
    extend(filters, this.getEntityStatesFilter());
    extend(filters, this.getEntityOwnerFilter());
    extend(filters, this.getEntityCustomFilter());

    return filters;
  },
  setSelectedList(list, lastSelectedIndex) {
    return this.set({
      [`${ this.getType() }Selected`]: list,
      lastSelectedIndex,
    });
  },
  getSelectedList() {
    return clone(this.get(`${ this.getType() }Selected`));
  },
  toggleSelected(model, isSelected, selectedIndex) {
    const selectedList = this.getSelectedList();

    selectedList[model.id] = isSelected;

    this.setSelectedList(selectedList, isSelected ? selectedIndex : null);
  },
  isSelected(model) {
    const selectedList = this.getSelectedList();

    return !!selectedList[model.id];
  },
  getSelected(collection) {
    const selectedList = this.getSelectedList();

    const collectionSelected = reduce(keys(selectedList), (selected, id) => {
      if (selectedList[id] && collection.get(id)) {
        selected.push({ id });
      }

      return selected;
    }, []);

    return Radio.request('entities', `${ this.getType() }:collection`, collectionSelected);
  },
  clearSelected() {
    this.setSelectedList({}, null);

    this.trigger('select:none');
  },
  selectMultiple(selectedIds, newLastSelectedIndex = null) {
    const selectedList = this.getSelectedList();

    const newSelectedList = selectedIds.reduce((selected, id) => {
      selected[id] = true;
      return selected;
    }, selectedList);

    this.setSelectedList(newSelectedList, newLastSelectedIndex);

    this.trigger('select:multiple');
  },
});
