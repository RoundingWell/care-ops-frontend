import { sortBy, isEqual, omit, size, isNull, clone } from 'underscore';

import Backbone from 'backbone';

export default Backbone.Model.extend({
  getDefaultSelectedStates() {
    return sortBy(this.get('defaultStates'));
  },
  getFilters() {
    return clone(this.get('filters'));
  },
  getStatesFilters() {
    return sortBy(this.get('states'));
  },
  getFilter(name) {
    return this.get('filters')[name];
  },
  setFilter(name, value) {
    const filters = this.getFilters();
    filters[name] = value;
    this.set('filters', filters);
  },
  getFiltersCount() {
    const customFilters = this.getFilters();
    const customFiltersCount = size(omit(customFilters, value => {
      return isNull(value);
    }));

    const statesFilter = this.getStatesFilters();
    const defaultStates = this.getDefaultSelectedStates();
    const statesFilterSize = !isEqual(statesFilter, defaultStates) ? 1 : 0;

    return customFiltersCount + statesFilterSize;
  },
  resetState() {
    this.set({
      filters: {},
      states: this.getDefaultSelectedStates(),
    });
  },
  getFiltersState() {
    return {
      filters: this.getFilters(),
      states: this.getStatesFilters(),
    };
  },
});
