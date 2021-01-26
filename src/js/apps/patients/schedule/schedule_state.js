import { clone, extend } from 'underscore';
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
        selectedDate: null,
        selectedMonth: null,
        relativeDate: null,
      },
      selectedActions: {},
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
    store.set(`schedule_${ this.currentClinician.id }`, this.attributes);
  },
  getFilters() {
    return clone(this.get('filters'));
  },
  getEntityDateFilter() {
    const { selectedDate, selectedMonth, relativeDate } = this.getFilters();

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
});
