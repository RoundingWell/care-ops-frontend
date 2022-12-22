import { clone, extend, keys, omit, reduce, each, filter, contains } from 'underscore';
import dayjs from 'dayjs';
import store from 'store';
import { NIL as NIL_UUID } from 'uuid';

import Backbone from 'backbone';
import Radio from 'backbone.radio';

import { RELATIVE_DATE_RANGES } from 'js/static';

export const STATE_VERSION = 'v4';

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
      filters: {
        states: [],
      },
      clinicianId: this.currentClinician.id,
      teamId: this.currentClinician.getTeam().id,
      noOwner: false,
      lastSelectedIndex: null,
      selectedActions: {},
      selectedFlows: {},
      searchQuery: '',
      listType: 'flows',
    };
  },
  preinitialize() {
    this.currentOrg = Radio.request('bootstrap', 'currentOrg');
    this.states = this.currentOrg.getStates();
    this.currentClinician = Radio.request('bootstrap', 'currentUser');
    this.groups = this.currentClinician.getGroups();
  },
  initialize() {
    this.on('change', this.onChange);
  },
  onChange() {
    store.set(`${ this.id }_${ this.currentClinician.id }-${ STATE_VERSION }`, omit(this.attributes, 'searchQuery', 'isFiltering'));
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
  getType() {
    return this.get('listType');
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
  formatDateRange(date, rangeType, dateFormat) {
    return `${ dayjs(date).startOf(rangeType).format(dateFormat) },${ dayjs(date).endOf(rangeType).format(dateFormat) }`;
  },
  getEntityDateFilter() {
    const { dateType, selectedDate, selectedMonth, selectedWeek, relativeDate } = this.getDateFilters();
    const dateFormat = (dateType === 'due_date') ? 'YYYY-MM-DD' : '';

    if (selectedDate) {
      return {
        [dateType]: this.formatDateRange(selectedDate, 'day', dateFormat),
      };
    }

    if (selectedMonth) {
      return {
        [dateType]: this.formatDateRange(selectedMonth, 'month', dateFormat),
      };
    }

    if (selectedWeek) {
      return {
        [dateType]: this.formatDateRange(selectedWeek, 'week', dateFormat),
      };
    }

    const { prev, unit } = relativeRanges.get(relativeDate || 'thismonth').pick('prev', 'unit');
    const relativeRange = dayjs().subtract(prev, unit);

    return {
      [dateType]: this.formatDateRange(relativeRange, unit, dateFormat),
    };
  },
  getDefaultStatesFilter() {
    const isDoneOnly = this.id === 'done-last-thirty-days';
    const onlyDoneStates = this.states.groupByDone().done;

    return isDoneOnly ? onlyDoneStates : this.states;
  },
  getDefaultSelectedStates() {
    const isDoneOnly = this.id === 'done-last-thirty-days';
    const { done, notDone } = this.states.groupByDone();

    return isDoneOnly ? done : notDone;
  },
  setDefaultFilterStates() {
    this.set({ filters: { states: this.getDefaultSelectedStates().map('id'), worklistId: this.id } });
  },
  getSelectedStates() {
    const defaultStatesFilterIds = this.getDefaultStatesFilter().map('id');
    const selectedStates = this.getFilters().states;

    // remove any invalid state ids (i.e. ids that don't belong to any default states)
    return filter(selectedStates, id => contains(defaultStatesFilterIds, id)).join();
  },
  getEntityFilter() {
    const filtersState = this.getFilters();
    const clinicianId = this.get('clinicianId');
    const teamId = this.get('teamId');
    const noOwner = this.get('noOwner');
    const customFilters = omit(filtersState, 'groupId', 'states', 'worklistId');
    const selectedStates = this.getSelectedStates();
    const dateFilter = this.getEntityDateFilter();

    const filters = {
      'owned-by': dateFilter,
      'shared-by': dateFilter,
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

    filters[this.id].state = selectedStates || NIL_UUID;

    if (this.groups.length) {
      filters[this.id].group = filtersState.groupId || this.groups.pluck('id').join(',');
    }

    if (this.id === 'shared-by' || !clinicianId) {
      const currentClinician = Radio.request('bootstrap', 'currentUser');
      const canViewAssignedActions = currentClinician.can('app:worklist:clinician_filter');
      filters[this.id].team = teamId;

      if (noOwner || !canViewAssignedActions) {
        filters[this.id].clinician = NIL_UUID;
      }
    } else {
      filters[this.id].clinician = clinicianId;
    }

    each(customFilters, (selected, slug) => {
      if (selected === null) return;

      filters[this.id][`@${ slug }`] = selected;
    });

    return filters[this.id];
  },
  getSelectedList() {
    return this.isFlowType() ? this.get('selectedFlows') : this.get('selectedActions');
  },
  toggleSelected(model, isSelected, selectedIndex) {
    const listName = this.isFlowType() ? 'selectedFlows' : 'selectedActions';
    const currentList = clone(this.get(listName));

    const newList = extend(currentList, {
      [model.id]: isSelected,
    });

    this.set({
      [listName]: newList,
      lastSelectedIndex: isSelected ? selectedIndex : null,
    });
  },
  isSelected(model) {
    const list = this.getSelectedList();

    return !!list[model.id];
  },
  getSelected(collection) {
    const list = this.getSelectedList();
    const collectionSelected = reduce(keys(list), (selected, item) => {
      if (list[item] && collection.get(item)) {
        selected.push({
          id: item,
        });
      }

      return selected;
    }, []);

    return Radio.request('entities', `${ this.getType() }:collection`, collectionSelected);
  },
  clearSelected() {
    const listName = this.isFlowType() ? 'selectedFlows' : 'selectedActions';

    this.set({
      [listName]: {},
      lastSelectedIndex: null,
    });

    this.trigger('select:none');
  },
  selectMultiple(selectedIds, newLastSelectedIndex = null) {
    const listName = this.isFlowType() ? 'selectedFlows' : 'selectedActions';

    const currentSelectedList = this.get(listName);

    const newSelectedList = selectedIds.reduce((selected, id) => {
      selected[id] = true;
      return selected;
    }, clone(currentSelectedList));

    this.set({
      [listName]: newSelectedList,
      lastSelectedIndex: newLastSelectedIndex,
    });

    this.trigger('select:multiple');
  },
});
