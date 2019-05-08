import _ from 'underscore';

import App from 'js/base/app';

export default App.extend({
  channelName: 'user-activity',
  radioEvents: {
    'all': 'triggerActivity',
  },
  radioRequests: {
    'set:interval': 'setInterval',
    'clear:interval': 'clearInterval',
  },
  initialize() {
    this._throttles = [];
  },
  triggerActivity() {
    this.triggerMethod('activity');
  },
  setInterval(callBack, ms, options) {
    ms = parseInt(ms, 10);

    if (!ms) return;

    const id = _.uniqueId('int');

    const throttledEvent = _.throttle(callBack, ms, options);

    this._throttles[id] = throttledEvent;

    this.on('activity', throttledEvent);

    return id;
  },
  clearInterval(id) {
    this.off('activity', this._throttles[id]);
  },
});
