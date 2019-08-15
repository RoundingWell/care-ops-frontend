import _ from 'underscore';
import Backbone from 'backbone';

import App from 'js/base/app';

export default App.extend({
  channelName: 'history',
  radioRequests: {
    'go:back': 'goBack',
    'route:current': 'getCurrentRoute',
    'route:previous': 'getPrevHistory',
  },
  initialize() {
    this.history = Backbone.history;

    // Set the initial history route
    this.setCurrent();

    // if a route changes set the current URL
    this.listenTo(this.history, 'current', this.setCurrent);
  },
  setCurrent() {
    // Deferred because the route fragment hasn't quite changed yet
    _.defer(_.bind(this._setCurrent, this));
  },
  _setCurrent() {
    const route = this.getCurrentRoute();
    if (route === this._currHistory) return;

    this._prevHistory = this._currHistory;
    this._currHistory = route;

    this.getChannel().trigger('change:route', route);
  },
  getPrevHistory() {
    return this._prevHistory;
  },
  getCurrentRoute() {
    return this.history.getFragment();
  },
  // if there was a previously recorded page go there
  // otherwise hit the default route
  // prevents a back to login (which would be a logout)
  goBack() {
    /* istanbul ignore if */
    if (this.getPrevHistory()) {
      this.history.history.back();
    } else {
      this._currHistory = undefined;
      // Hit the default route
      this.history.navigate('', { trigger: true });
    }
  },
});
