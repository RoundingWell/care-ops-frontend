import { bind, defer } from 'underscore';
import Backbone from 'backbone';

import App from 'js/base/app';

export default App.extend({
  channelName: 'history',
  radioRequests: {
    'go:back': 'goBack',
    'route:current': 'getCurrentRoute',
  },
  initialize() {
    this.history = Backbone.history;
    this._prevHistory = [];
    this._currLength = 0;

    // Set the initial history route
    this.setCurrent();

    // if a route changes set the current URL
    this.listenTo(this.history, 'current', this.setCurrent);
  },
  setCurrent() {
    // Deferred because the route fragment hasn't quite changed yet
    defer(bind(this._setCurrent, this));
  },
  _setCurrent() {
    const route = this.getCurrentRoute();
    if (route === this._currHistory) return;

    /* istanbul ignore next:
        If storing more routes than history, browser went back */
    if (this._currLength > this.history.history.length) {
      this._prevHistory.pop();
    } else {
      this._prevHistory.push(this._currHistory);
    }

    this._currHistory = route;
    this._currLength = this.history.history.length;
    this.getChannel().trigger('change:route', route);
  },
  getCurrentRoute() {
    return this.history.getFragment();
  },
  goBack() {
    this.history.navigate(this._prevHistory.pop(), { trigger: true });
  },
});
