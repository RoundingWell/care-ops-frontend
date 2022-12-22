import { sortBy, isEqual, omit, size, isNull } from 'underscore';

import Backbone from 'backbone';
import Radio from 'backbone.radio';

export default Backbone.Model.extend({
  preinitialize() {
    this.currentOrg = Radio.request('bootstrap', 'currentOrg');
    this.states = this.currentOrg.getStates();
  },
  getFiltersCount() {
    const defaultStatesFilter = this.states.groupByDone().notDone;

    const customFiltersState = omit(this.attributes, 'states', 'worklistId');
    const customFiltersCount = size(omit(customFiltersState, value => {
      return isNull(value);
    }));

    const statesFilter = sortBy(this.attributes.states);
    const defaultStates = sortBy(defaultStatesFilter.map('id'));
    const statesFilterSize = !isEqual(statesFilter, defaultStates) ? 1 : 0;

    return customFiltersCount + statesFilterSize;
  },
});
