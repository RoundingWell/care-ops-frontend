import _ from 'underscore';
import Radio from 'backbone.radio';
import { Behavior } from 'marionette';

export default Behavior.extend({
  initialize() {
    this.listenTo(Radio.channel('user-activity'), 'document:keydown', this.keydown);
  },

  keyEvents: {},

  triggerEvent(event, domEvent, keyCode) {
    if (domEvent.which === keyCode) {
      this.view.triggerMethod(event, domEvent);

      return true;
    }
  },

  keydown(domEvent) {
    _.some(this.getOptions('keyEvents'), (keyCode, event) => {
      if (!_.isArray(keyCode)) {
        this.triggerEvent(event, domEvent, keyCode);
        return;
      }

      return _.some(keyCode, _.bind(this.triggerEvent, this, event, domEvent));
    });
  },
});
