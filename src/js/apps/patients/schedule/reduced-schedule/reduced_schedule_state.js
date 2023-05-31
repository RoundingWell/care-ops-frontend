import { clone, extend, reduce, intersection, omit } from 'underscore';
import store from 'store';
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import { NIL as NIL_UUID } from 'uuid';

const STATE_VERSION = 'v5';

export default Backbone.Model.extend({
  defaults() {
    return {
      isReduced: true,
      filters: {},
      states: [],
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
    return `reduced-schedule_${ this.currentClinician.id }_${ this.currentWorkspace.id }-${ STATE_VERSION }`;
  },
  getStore() {
    return store.get(this.getStoreKey());
  },
  onChange() {
    store.set(this.getStoreKey(), omit(this.attributes, 'searchQuery'));
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
  getEntityStatesFilter() {
    const availableStateFilterIds = this.getAvailableStates().map('id');
    const selectedStates = this.getStatesFilters();
    const selectedAvailableStates = intersection(selectedStates, availableStateFilterIds);

    return { state: selectedAvailableStates.join() || NIL_UUID };
  },
  getOwner() {
    return this.currentClinician;
  },
  getEntityCustomFilter() {
    const filtersState = this.getFilters();
    return reduce(filtersState, (filters, selected, slug) => {
      if (selected !== null) filters[`@${ slug }`] = selected;

      return filters;
    }, {});
  },
  getEntityFilter() {
    const filters = {
      clinician: this.currentClinician.id,
    };

    extend(filters, this.getEntityStatesFilter());
    extend(filters, this.getEntityCustomFilter());

    return filters;
  },
});
