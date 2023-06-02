import { extend } from 'underscore';

import Backbone from 'backbone';

import MultiselectStateMixin from 'js/mixins/multiselect-state_mixin';

const StateModel = Backbone.Model.extend({
  defaults() {
    return {
      actionBeingEdited: null,
      lastSelectedIndex: null,
      actionsSelected: {},
    };
  },
  isBeingEdited(model) {
    return this.get('actionBeingEdited') === model.id;
  },
  getType() {
    return 'actions';
  },
});

extend(StateModel.prototype, MultiselectStateMixin);

export default StateModel;
