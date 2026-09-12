import { isFunction, isString, result } from 'underscore';

export default {
  viewEventPrefix: false,

  _buildEventProxies() {
    this._viewEvents = this.normalizeMethods(result(this, 'viewEvents') || {});
    this._viewTriggers = result(this, 'viewTriggers') || {};
    this._viewEventPrefix = result(this, 'viewEventPrefix');
  },

  _proxyViewEvents(view) {
    this.listenTo(view, 'all', this._childViewEventHandler);
  },

  _childViewEventHandler(eventName, ...args) {
    const viewEvent = this._viewEvents[eventName];

    if (isFunction(viewEvent)) viewEvent.apply(this, args);

    const viewTrigger = this._viewTriggers[eventName];

    if (isString(viewTrigger)) this.triggerMethod(viewTrigger, ...args);

    if (this._viewEventPrefix !== false) {
      this.triggerMethod(`${ this._viewEventPrefix }:${ eventName }`, ...args);
    }
  },
};
