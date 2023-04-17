import { clone, omit, each, filter, contains } from 'underscore';
import store from 'store';
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import { NIL as NIL_UUID } from 'uuid';

const STATE_VERSION = 'v4';

export default Backbone.Model.extend({
  defaults() {
    return {
      isReduced: true,
      filters: {},
      states: [],
      clinicianId: this.currentClinician.id,
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
  getAvailableStates() {
    return this.states;
  },
  setDefaultFilterStates() {
    this.set({ filters: {}, states: this.getDefaultSelectedStates() });
  },
  getDefaultSelectedStates() {
    const notDoneStates = this.states.groupByDone().notDone;
    return notDoneStates.map('id');
  },
  getSelectedStates() {
    const availableStateFilterIds = this.getAvailableStates().map('id');
    const selectedStates = this.getStatesFilters();

    return filter(selectedStates, id => contains(availableStateFilterIds, id)).join() || NIL_UUID;
  },
  getFiltersState() {
    return {
      filters: this.getFilters(),
      states: this.getStatesFilters(),
      defaultStates: this.getDefaultSelectedStates(),
    };
  },
  getEntityFilter() {
    const filtersState = this.getFilters();
    const clinicianId = this.get('clinicianId');
    const selectedStates = this.getSelectedStates();

    const filters = {
      clinician: clinicianId,
      state: selectedStates,
    };

    each(filtersState, (selected, slug) => {
      if (selected === null) return;

      filters[`@${ slug }`] = selected;
    });

    return filters;
  },
});
