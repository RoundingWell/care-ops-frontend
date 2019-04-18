import _ from 'underscore';
import Radio from 'backbone.radio';
import { Behavior } from 'marionette';

export default Behavior.extend({
  initialize() {
    this.listenTo(Radio.channel('user-activity'), 'document:keydown', this.keydown);
  },

  keydown(evt) {
    _.some(this.options, function(keyCode, event) {
      if (!_.isArray(keyCode)) {
        keyCode = [keyCode];
      }

      return _.some(keyCode, function(key) {
        if (evt.which === key) {
          this.view.triggerMethod(event, evt);

          return true;
        }
      }, this);
    }, this);
  },
});
