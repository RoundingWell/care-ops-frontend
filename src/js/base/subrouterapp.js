import _ from 'underscore';
import { normalizeMethods } from 'marionette';

import App from './app';

export default App.extend({
  constructor() {
    this._current = null;

    this.initRouter();

    this.on('before:stop', this.stopCurrent);

    App.apply(this, arguments);
  },

  initRouter() {
    const eventRoutes = _.result(this, 'eventRoutes', {});
    this._eventRoutes = normalizeMethods(this, eventRoutes);
  },

  // Start a route from a currentRoute passed from a routerapp
  startRoute({ event, eventArgs }) {
    const action = this._eventRoutes[event];

    action.apply(this, eventArgs);
  },

  mixinOptions(options) {
    const appOptions = _.result(this, 'currentAppOptions');

    return _.extend({}, appOptions, options);
  },

  // handler that ensures one running app per type
  startCurrent(appName, options) {
    this.stopCurrent();

    const app = this.startChildApp(appName, this.mixinOptions(options));

    this._current = app;

    return app;
  },

  getCurrent() {
    return this._current;
  },

  stopCurrent() {
    if (!this._current) return;

    this._current.stop();
    this._current = null;
  },
});
