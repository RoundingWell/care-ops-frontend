import { clone, extend, keys, omit, reduce, intersection } from 'underscore';
import dayjs from 'dayjs';
import store from 'store';
import { NIL as NIL_UUID } from 'uuid';

import Backbone from 'backbone';
import Radio from 'backbone.radio';

import { RELATIVE_DATE_RANGES } from 'js/static';

const relativeRanges = new Backbone.Collection(RELATIVE_DATE_RANGES);

const STATE_VERSION = 'v5';

export default Backbone.Model.extend({
  defaults() {
    return {
      isFiltering: false,
      filters: {},
      states: [],
      clinicianId: this.currentClinician.id,
      dateFilters: {
        dateType: 'due_date',
        selectedDate: null,
        selectedMonth: null,
        selectedWeek: null,
        relativeDate: null,
      },
      lastSelectedIndex: null,
      actionsSelected: {},
      searchQuery: '',
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
  getStoreKey() {
    return `schedule_${ this.currentClinician.id }_${ this.currentWorkspace.id }-${ STATE_VERSION }`;
  },
  getStore() {
    return store.get(this.getStoreKey());
  },
  onChange() {
    store.set(this.getStoreKey(), omit(this.attributes, 'isFiltering', 'lastSelectedIndex', 'searchQuery'));
  },
  setDateFilters(filters) {
    this.set('dateFilters', clone(filters));
  },
  getDateFilters() {
    return clone(this.get('dateFilters'));
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
  getAvailableStates() {
    return this.states;
  },
  getDefaultSelectedStates() {
    const notDoneStates = this.states.groupByDone().notDone;

    return notDoneStates.map('id');
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
  formatDateRange(date, rangeType) {
    const dateFormat = 'YYYY-MM-DD';
    return `${ dayjs(date).startOf(rangeType).format(dateFormat) },${ dayjs(date).endOf(rangeType).format(dateFormat) }`;
  },
  getDateRange({ selectedDate, selectedMonth, selectedWeek, relativeDate }) {
    if (selectedDate) return this.formatDateRange(selectedDate, 'day');

    if (selectedMonth) return this.formatDateRange(selectedMonth, 'month');

    if (selectedWeek) return this.formatDateRange(selectedWeek, 'week');

    relativeDate = relativeDate || 'thismonth';
    const { prev, unit } = relativeRanges.get(relativeDate).pick('prev', 'unit');
    const relativeRange = dayjs().subtract(prev, unit);

    return this.formatDateRange(relativeRange, unit);
  },
  getEntityDateFilter() {
    const dateFilters = this.getDateFilters();
    if (dateFilters.relativeDate === 'alltime') return {};

    return {
      due_date: this.getDateRange(dateFilters),
    };
  },
  getEntityStatesFilter() {
    const availableStateFilterIds = this.getAvailableStates().map('id');
    const selectedStates = this.getStatesFilters();
    const selectedAvailableStates = intersection(selectedStates, availableStateFilterIds);

    return { state: selectedAvailableStates.join() || NIL_UUID };
  },
  getOwner() {
    const clinician = this.get('clinicianId');

    return Radio.request('entities', 'clinicians:model', clinician);
  },
  getEntityOwnerFilter() {
    const clinician = this.get('clinicianId');

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
      actionsSelected: list,
      lastSelectedIndex,
    });
  },
  getSelectedList() {
    return clone(this.get('actionsSelected'));
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

    return Radio.request('entities', 'actions:collection', collectionSelected);
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
