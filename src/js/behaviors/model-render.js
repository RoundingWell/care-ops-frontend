import _ from 'underscore';
import { Behavior } from 'marionette';

// Set an array of attributes from the model that should trigger a render

export default Behavior.extend({
  modelEvents: {
    'change'(model) {
      /* istanbul ignore if */
      if (this.view.isDestroyed()) return;

      // Sets an array of attribute names
      const attrs = this.options.changeAttributes;

      /* istanbul ignore if: only for dev safety */
      if (!attrs) {
        throw new Error('changeAttributes must be defined.');
      }

      const keys = _.keys(model.changed);

      // In intersection we are checking to see if any of value of the attrs
      // array is contained in the keys array

      if (_.intersection(keys, attrs).length) {
        this.view.render();
      }
    },
  },
});
