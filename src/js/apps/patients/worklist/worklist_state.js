import { clone, extend, omit, reduce } from 'underscore';
import dayjs from 'dayjs';
import store from 'store';
import { NIL as NIL_UUID } from 'uuid';

import Backbone from 'backbone';
import Radio from 'backbone.radio';

import MultiselectStateMixin from 'js/mixins/multiselect-state_mixin';

import { RELATIVE_DATE_RANGES } from 'js/static';

const relativeRanges = new Backbone.Collection(RELATIVE_DATE_RANGES);

const STATE_VERSION = 'v6';

const StateModel = Backbone.Model.extend({
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
  getFiltersState() {
    return {
      customFilters: this.get('customFilters'),
      states: this.get('states'),
      flowStates: this.get('flowStates'),
      listType: this.get('listType'),
      isDoneOnly: this.id === 'done-last-thirty-days',
    };
  },
  preinitialize() {
    this.currentClinician = Radio.request('bootstrap', 'currentUser');
    this.currentWorkspace = Radio.request('workspace', 'current');
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
    store.set(this.getStoreKey(this.id), omit(this.attributes, 'lastSelectedIndex', 'searchQuery'));
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
  setDateFilters(filters) {
    return this.set(`${ this.getType() }DateFilters`, clone(filters));
  },
  getDateFilters() {
    return clone(this.get(`${ this.getType() }DateFilters`));
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
    const state = this.get('states').join() || NIL_UUID;

    if (this.isFlowType()) return { state };

    return {
      state,
      'flow.state': this.get('flowStates').join() || NIL_UUID,
    };
  },
  isOwnerTeam() {
    const clinician = this.get('clinicianId');

    return this.id === 'shared-by' || !clinician;
  },
  getOwner() {
    const clinician = this.get('clinicianId');

    if (this.isOwnerTeam()) return Radio.request('entities', 'teams:model', this.get('teamId'));

    return Radio.request('entities', 'clinicians:model', clinician);
  },
  getEntityOwnerFilter() {
    const clinician = this.get('clinicianId');

    if (this.isOwnerTeam()) {
      const team = this.get('teamId');
      const noOwner = this.get('noOwner');
      const canFilterClinicians = this.currentClinician.can('app:worklist:clinician_filter');

      if (noOwner || !canFilterClinicians) return { team, clinician: NIL_UUID };

      return { team };
    }

    return { clinician };
  },
  getEntityCustomFilter() {
    const filtersState = this.get('customFilters');
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
});

extend(StateModel.prototype, MultiselectStateMixin);

export default StateModel;

