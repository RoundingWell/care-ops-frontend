import $ from 'jquery';
import _ from 'underscore';
import { App } from 'marionette.toolkit';

export default App.extend({
  constructor(options = {}) {
    this.mergeOptions(options, ['stateId']);

    App.prototype.constructor.apply(this, arguments);
  },
  start(options) {
    const opts = _.extend({ state: {} }, options);

    _.defaults(opts.state, { id: this._getStateId(options) });

    const args = _.toArray(arguments);
    args[0] = opts;

    return App.prototype.start.apply(this, args);
  },

  _getStateId(options) {
    if (_.isFunction(this.stateId)) {
      return this.stateId(options);
    }

    return this.stateId;
  },
  // Override with string or function that return unique stateId
  stateId() {
    return _.uniqueId('_stateId');
  },
  triggerStart(options) {
    this._isLoading = true;

    this._fetchId = _.uniqueId('fetch');
    const triggerSyncData = _.bind(this.triggerMethod, this, 'sync:data', this._fetchId, options);
    $.when(this.beforeStart(options)).done(triggerSyncData);
  },
  beforeStart: _.noop,
  onSyncData(fetchId) {
    this._isLoading = false;
    if (!this.isRunning() || this._fetchId !== fetchId) return;

    this.finallyStart.apply(this, _.rest(arguments));
  },
  isRunning() {
    return this._isRunning && !this.isLoading();
  },
  _isLoading: false,
  isLoading() {
    return this._isLoading;
  },
  _stopRunningEvents() {
    _.each(this._runningEvents, _.bind(function(args) {
      this.off.apply(this, args);
    }, this));
    this._runningEvents = [];
  },
  _stopRunningListeners() {
    _.each(this._runningListeningTo, _.bind(function(args) {
      this.stopListening.apply(this, args);
    }, this));
    this._runningListeningTo = [];
  },
});

