import $ from 'jquery';
import { bind, isArray, noop, rest, uniqueId } from 'underscore';
import { App } from 'marionette.toolkit';

export default App.extend({
  triggerStart(options) {
    this._isLoading = true;

    this._fetchId = uniqueId('fetch');
    const triggerSyncData = bind(this.triggerMethod, this, 'sync:data', this._fetchId, options);
    const triggerFail = bind(this.triggerSyncFail, this, this._fetchId, options);
    const promise = this.beforeStart(options);

    (isArray(promise) ? $.when(...promise) : $.when(promise))
      .fail(triggerFail)
      .done(triggerSyncData);
  },
  beforeStart: noop,
  onSyncData(fetchId) {
    this._isLoading = false;
    if (!this.isRunning() || this._fetchId !== fetchId) return;

    this.finallyStart.apply(this, rest(arguments));
  },
  triggerSyncFail(fetchId, options) {
    this._isLoading = false;
    if (!this.isRunning() || this._fetchId !== fetchId) return;

    this.triggerMethod('fail', options);
  },
  isRunning() {
    return this._isRunning && !this.isLoading();
  },
  _isLoading: false,
  isLoading() {
    return this._isLoading;
  },
});

