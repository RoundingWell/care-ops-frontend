import $ from 'jquery';
import _ from 'underscore';
import { App } from 'marionette.toolkit';

export default App.extend({
  triggerStart(options) {
    this._isLoading = true;

    this._fetchId = _.uniqueId('fetch');
    const triggerSyncData = _.bind(this.triggerMethod, this, 'sync:data', this._fetchId, options);
    const triggerFail = _.bind(this.triggerMethod, this, 'fail', options);
    $.when(this.beforeStart(options)).fail(triggerFail).done(triggerSyncData);
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

  // TODO: https://github.com/RoundingWellOS/marionette.toolkit/issues/243
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

  // TODO: https://github.com/RoundingWellOS/marionette.toolkit/issues/242
  showView(view = this._view, ...args) {
    const region = this.getRegion();

    region.show(view, ...args);

    if (!this.isRunning()) this.setView(region.currentView);

    return view;
  },
});

