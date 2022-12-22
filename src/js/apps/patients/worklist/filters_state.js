import { sortBy, isEqual, omit, size, isNull } from 'underscore';

import Backbone from 'backbone';
import Radio from 'backbone.radio';

export default Backbone.Model.extend({
  preinitialize() {
    this.currentOrg = Radio.request('bootstrap', 'currentOrg');
    this.states = this.currentOrg.getStates();
  },
  getDefaultStatesFilter() {
    const isDoneOnly = this.get('worklistId') === 'done-last-thirty-days';
    const { done, notDone } = this.states.groupByDone();

    return isDoneOnly ? done : notDone;
  },
  getFiltersCount() {
    const customFiltersState = omit(this.attributes, 'states', 'worklistId');
    const customFiltersCount = size(omit(customFiltersState, value => {
      return isNull(value);
    }));

    const statesFilter = sortBy(this.attributes.states);
    const defaultStates = sortBy(this.getDefaultStatesFilter().map('id'));
    const statesFilterSize = !isEqual(statesFilter, defaultStates) ? 1 : 0;

    return customFiltersCount + statesFilterSize;
  },
});
