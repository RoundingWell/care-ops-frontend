import { clone, contains, difference, extend, keys, omit, reduce } from 'underscore';
import dayjs from 'dayjs';
import store from 'store';

import Backbone from 'backbone';
import Radio from 'backbone.radio';

export default Backbone.Model.extend({
  defaults() {
    return {
      actionsSortId: 'sortCreatedDesc',
      flowsSortId: 'sortCreatedDesc',
      actionsDateFilters: {
        dateType: 'created_at',
        selectedDate: null,
        selectedMonth: null,
        relativeDate: null,
      },
      flowsDateFilters: {
        dateType: 'created_at',
        selectedDate: null,
        selectedMonth: null,
        relativeDate: null,
      },
      filters: {
        groupId: null,
        clinicianId: this.currentClinician.id,
        roleId: this.currentClinician.getRole().id,
      },
      selectedActions: {},
      selectedFlows: {},
      searchQuery: '',
      type: 'flows',
      visibleIds: [],
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
    store.set(`${ this.id }_${ this.currentClinician.id }`, omit(this.attributes, 'searchQuery', 'visibleIds'));
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
    return this.get('type');
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
    const { dateType, selectedDate, selectedMonth, relativeDate } = this.getDateFilters();
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

    if (relativeDate === 'today') {
      return {
        [dateType]: this.formatDateRange(dayjs(), 'day', dateFormat),
      };
    }

    if (relativeDate === 'yesterday') {
      const yesterday = dayjs().subtract(1, 'days');
      return {
        [dateType]: this.formatDateRange(yesterday, 'day', dateFormat),
      };
    }

    // This month
    return {
      [dateType]: this.formatDateRange(dayjs(), 'month', dateFormat),
    };
  },
  getEntityFilter() {
    const { groupId, clinicianId, roleId } = this.getFilters();
    const group = groupId || this.groups.pluck('id').join(',');
    const status = 'queued,started';

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
        status: 'done',
        group,
      },
    };

    if (this.id === 'shared-by' || !clinicianId) {
      filters[this.id].role = roleId;
    } else {
      filters[this.id].clinician = clinicianId;
    }

    return filters[this.id];
  },
  getSelectedList() {
    const list = this.isFlowType() ? this.get('selectedFlows') : this.get('selectedActions');
    const hiddenIds = difference(keys(list), this.get('visibleIds'));

    return omit(list, hiddenIds);
  },
  toggleSelected(model, isSelected) {
    const listName = this.isFlowType() ? 'selectedFlows' : 'selectedActions';
    const list = clone(this.get(listName));

    this.set(listName, extend(list, {
      [model.id]: isSelected,
    }));
  },
  isSelected(model) {
    if (!this.get('visibleIds').find(id => id === model.id)) {
      return;
    }

    const list = this.getSelectedList();

    return list[model.id];
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
    const visibleIds = this.get('visibleIds');

    const list = collection.reduce((selected, model) => {
      if (!contains(visibleIds, model.id)) return selected;
      selected[model.id] = true;
      return selected;
    }, {});

    this.set(listName, list);

    this.trigger('select:all');
  },
});
