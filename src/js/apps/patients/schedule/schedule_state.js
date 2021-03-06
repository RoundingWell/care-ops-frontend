import { clone, extend, keys, omit, reduce } from 'underscore';
import store from 'store';
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import dayjs from 'dayjs';

export default Backbone.Model.extend({
  defaults() {
    return {
      filters: {
        groupId: null,
        clinicianId: this.currentClinician.id,
      },
      dateFilters: {
        dateType: 'due_date',
        selectedDate: null,
        selectedMonth: null,
        relativeDate: null,
      },
      selectedActions: {},
      searchQuery: '',
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
    store.set(`schedule_${ this.currentClinician.id }`, omit(this.attributes, 'searchQuery'));
  },
  getFilters() {
    return clone(this.get('filters'));
  },
  getDateFilters() {
    return clone(this.get('dateFilters'));
  },
  getEntityDateFilter() {
    const { selectedDate, selectedMonth, relativeDate } = this.getDateFilters();

    if (selectedDate) {
      return {
        due_date: this.formatDateRange(selectedDate, 'day'),
      };
    }

    if (selectedMonth) {
      return {
        due_date: this.formatDateRange(selectedMonth, 'month'),
      };
    }

    if (relativeDate === 'today') {
      return {
        due_date: this.formatDateRange(dayjs(), 'day'),
      };
    }

    if (relativeDate === 'yesterday') {
      const yesterday = dayjs().subtract(1, 'days');
      return {
        due_date: this.formatDateRange(yesterday, 'day'),
      };
    }

    // This month
    return {
      due_date: this.formatDateRange(dayjs(), 'month'),
    };
  },
  getEntityFilter() {
    const { groupId, clinicianId } = this.getFilters();
    const group = groupId || this.groups.pluck('id').join(',');
    const status = 'queued,started';

    const dateFilter = this.getEntityDateFilter();

    const filters = extend({
      clinician: clinicianId,
      status,
      group,
    }, dateFilter);

    return filters;
  },
  formatDateRange(date, rangeType) {
    const dateFormat = 'YYYY-MM-DD';

    return `${ dayjs(date).startOf(rangeType).format(dateFormat) },${ dayjs(date).endOf(rangeType).format(dateFormat) }`;
  },
  toggleSelected(model, isSelected) {
    const list = clone(this.get('selectedActions'));

    this.set('selectedActions', extend(list, {
      [model.id]: isSelected,
    }));
  },
  isSelected(model) {
    return !!this.get('selectedActions')[model.id];
  },
  getSelected(collection) {
    const list = this.get('selectedActions');
    const collectionSelected = reduce(keys(list), (selected, item) => {
      if (list[item] && collection.get(item)) {
        selected.push({
          id: item,
        });
      }

      return selected;
    }, []);

    return Radio.request('entities', 'actions:collection', collectionSelected);
  },
  clearSelected() {
    this.set('selectedActions', {});
    this.trigger('select:none');
  },
  selectAll(collection) {
    const list = collection.reduce((selected, model) => {
      selected[model.id] = true;
      return selected;
    }, {});

    this.set('selectedActions', list);

    this.trigger('select:all');
  },
});
