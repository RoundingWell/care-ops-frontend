import { clone, extend, reduce, keys } from 'underscore';
import dayjs from 'dayjs';
import store from 'store';

import Backbone from 'backbone';
import Radio from 'backbone.radio';

export default Backbone.Model.extend({
  defaults() {
    return {
      actionsSortId: 'sortCreatedDesc',
      flowsSortId: 'sortCreatedDesc',
      filters: {
        type: 'flows',
        groupId: null,
        clinicianId: this.currentClinician.id,
        roleId: this.currentClinician.getRole().id,
        dateType: 'created_at',
        selectedDate: null,
        selectedMonth: null,
        relativeDate: null,
      },
      selectedActions: {},
      selectedFlows: {},
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
    store.set(`${ this.id }_${ this.currentClinician.id }`, this.attributes);
  },
  getFilters() {
    return clone(this.get('filters'));
  },
  getType() {
    return this.getFilters().type;
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
  getEntityDateFilter() {
    const { dateType, selectedDate, selectedMonth, relativeDate } = this.getFilters();

    if (selectedDate) {
      return {
        [dateType]: `${ dayjs(selectedDate).startOf('day').format() },${ dayjs(selectedDate).endOf('day').format() }`,
      };
    }

    if (selectedMonth) {
      return {
        [dateType]: `${ dayjs(selectedMonth).startOf('month').format() },${ dayjs(selectedMonth).endOf('month').format() }`,
      };
    }

    if (relativeDate === 'today') {
      return {
        [dateType]: `${ dayjs().startOf('day').format() },${ dayjs().endOf('day').format() }`,
      };
    }

    if (relativeDate === 'yesterday') {
      const yesterday = dayjs().subtract(1, 'days');
      return {
        [dateType]: `${ yesterday.startOf('day').format() },${ yesterday.endOf('day').format() }`,
      };
    }

    // This month
    return {
      [dateType]: `${ dayjs().startOf('month').format() },${ dayjs().endOf('month').format() }`,
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

    const list = collection.reduce((selected, model) => {
      selected[model.id] = true;
      return selected;
    }, {});

    this.set(listName, list);

    this.trigger('select:all');
  },
});
