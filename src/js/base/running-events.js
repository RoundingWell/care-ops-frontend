import { each } from 'underscore';
import { MnObject } from 'marionette';

export default {
  _stopRunningEvents() {
    each(this._runningEvents, args => this.off(...args));
  },

  _stopRunningListeners() {
    each(this._runningListeningTo, args => this.stopListening(...args));
  },

  on(...args) {
    if (this._isRunning) {
      this._runningEvents = this._runningEvents || [];
      this._runningEvents.push(args);
    }

    return MnObject.prototype.on.apply(this, args);
  },

  _on: MnObject.prototype.on,

  listenTo(...args) {
    if (this._isRunning) {
      this._runningListeningTo = this._runningListeningTo || [];
      this._runningListeningTo.push(args);
    }

    return MnObject.prototype.listenTo.apply(this, args);
  },

  _listenTo: MnObject.prototype.listenTo,

  listenToOnce(...args) {
    if (this._isRunning) {
      this._runningListeningTo = this._runningListeningTo || [];
      this._runningListeningTo.push(args);
    }

    return MnObject.prototype.listenToOnce.apply(this, args);
  },
};
