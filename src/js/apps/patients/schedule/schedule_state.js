import { clone, extend, keys, omit, reduce, each } from 'underscore';
import store from 'store';
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import dayjs from 'dayjs';

import { RELATIVE_DATE_RANGES } from 'js/static';

const relativeRanges = new Backbone.Collection(RELATIVE_DATE_RANGES);

export const STATE_VERSION = 'v3';

export default Backbone.Model.extend({
  defaults() {
    return {
      isFiltering: false,
      filters: {},
      clinicianId: this.currentClinician.id,
      dateFilters: {
        dateType: 'due_date',
        selectedDate: null,
        selectedMonth: null,
        selectedWeek: null,
        relativeDate: null,
      },
      selectedActions: {},
      searchQuery: '',
    };
  },
  preinitialize() {
    this.currentOrg = Radio.request('bootstrap', 'currentOrg');

    this.currentClinician = Radio.request('bootstrap', 'currentUser');
    this.groups = this.currentClinician.getGroups();
  },
  initialize() {
    this.on('change', this.onChange);
  },
  onChange() {
    store.set(`schedule_${ this.currentClinician.id }-${ STATE_VERSION }`, omit(this.attributes, 'searchQuery', 'isFiltering'));
  },
  getFilters() {
    return clone(this.get('filters'));
  },
  getDateFilters() {
    return clone(this.get('dateFilters'));
  },
  getEntityDateFilter() {
    const { selectedDate, selectedMonth, selectedWeek, relativeDate } = this.getDateFilters();

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

    if (selectedWeek) {
      return {
        due_date: this.formatDateRange(selectedWeek, 'week'),
      };
    }

    const { prev, unit } = relativeRanges.get(relativeDate || 'thismonth').pick('prev', 'unit');
    const relativeRange = dayjs().subtract(prev, unit);

    return {
      due_date: this.formatDateRange(relativeRange, unit),
    };
  },
  getEntityFilter() {
    const states = this.currentOrg.getStates();
    const filtersState = this.getFilters();
    const clinicianId = this.get('clinicianId');
    const customFilters = omit(filtersState, 'groupId');
    const notDoneStates = states.groupByDone().notDone.getFilterIds();

    const dateFilter = this.getEntityDateFilter();

    const filters = extend({
      clinician: clinicianId,
      state: notDoneStates,
    }, dateFilter);

    if (this.groups.length) {
      filters.group = filtersState.groupId || this.groups.pluck('id').join(',');
    }

    each(customFilters, (selected, slug) => {
      if (selected === null) return;

      filters[`@${ slug }`] = selected;
    });

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
