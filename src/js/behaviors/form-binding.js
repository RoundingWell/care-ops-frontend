import _ from 'underscore';
import { Behavior } from 'marionette';

//
// Given modelSelectorBinding{ someModelAttr: '.js-some-selector'  }
// someModelAttr will be set to $('.js-some-selector').val()
// on blur of that selector
//

export default Behavior.extend({
  options: {
    modelSelectorBinding: {},
  },
  events() {
    const bindings = this.getOption('modelSelectorBinding');
    return _.reduce(bindings, (events, selector, modelKey) => {
      const eventName = selector.event || 'input';
      selector = selector.selector || selector;
      events[`${ eventName } ${ selector }`] = ({ currentTarget }) => {
        this.view.model.set(modelKey, _.trim(this.view.$(currentTarget).val()));
      };
      return events;
    }, {});
  },
});
