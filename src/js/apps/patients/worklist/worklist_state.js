import { clone, extend, keys, omit, reduce } from 'underscore';
import dayjs from 'dayjs';
import store from 'store';
import { NIL as NIL_UUID } from 'uuid';

import Backbone from 'backbone';
import Radio from 'backbone.radio';

import { STATE_STATUS, RELATIVE_DATE_RANGES } from 'js/static';

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
      filters: {
        groupId: null,
        clinicianId: this.currentClinician.id,
        roleId: this.currentClinician.getRole().id,
        noOwner: false,
      },
      selectedActions: {},
      selectedFlows: {},
      searchQuery: '',
      listType: 'flows',
    };
  },
  preinitialize() {
    this.currentClinician = Radio.request('bootstrap', 'currentUser');
    this.groups = this.currentClinician.getGroups();
  },
  initialize() {
    this.on('change', this.onChange);
  },
  onChange() {
    store.set(`${ this.id }_${ this.currentClinician.id }-v2`, omit(this.attributes, 'searchQuery'));
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
  getEntityFilter() {
    const { groupId, clinicianId, roleId, noOwner } = this.getFilters();
    const group = groupId || this.groups.pluck('id').join(',');
    const status = [STATE_STATUS.QUEUED, STATE_STATUS.STARTED].join(',');

    const dateFilter = this.getEntityDateFilter();

    const filters = {
      'owned-by': extend({ status, group }, dateFilter),
      'shared-by': extend({ status, group }, dateFilter),
      'new-past-day': {
        created_at: dayjs().subtract(24, 'hours').format(),
        status,
        group,
      },
      'updated-past-three-days': {
        updated_at: dayjs().startOf('day').subtract(3, 'days').format(),
        status,
        group,
      },
      'done-last-thirty-days': {
        updated_at: dayjs().startOf('day').subtract(30, 'days').format(),
        status: STATE_STATUS.DONE,
        group,
      },
    };

    if (this.id === 'shared-by' || !clinicianId) {
      const currentClinician = Radio.request('bootstrap', 'currentUser');
      const canViewAssignedActions = currentClinician.can('view:assigned:actions');
      filters[this.id].role = roleId;

      if (noOwner || !canViewAssignedActions) {
        filters[this.id].clinician = NIL_UUID;
      }
    } else {
      filters[this.id].clinician = clinicianId;
    }

    return filters[this.id];
  },
  getSelectedList() {
    return this.isFlowType() ? this.get('selectedFlows') : this.get('selectedActions');
  },
  toggleSelected(model, isSelected) {
    const listName = this.isFlowType() ? 'selectedFlows' : 'selectedActions';
    const list = clone(this.get(listName));

    this.set(listName, extend(list, {
      [model.id]: isSelected,
    }));
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

    this.set(listName, {});
    this.trigger('select:none');
  },
  selectAll(collection) {
    const listName = this.isFlowType() ? 'selectedFlows' : 'selectedActions';

    const list = collection.reduce((selected, model) => {
      selected[model.id] = true;
      return selected;
    }, {});

    this.set(listName, list);

    this.trigger('select:all');
  },
});
