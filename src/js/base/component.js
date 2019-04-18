import _ from 'underscore';

import { Component } from 'marionette.toolkit';

export default Component.extend({

  // FIXME: Remove carefully pre-component first (ie: `false`)
  viewEventPrefix: 'view',

  stateId: function() {
    return _.uniqueId('_stateId');
  },
  constructor(options = {}) {
    this.mergeOptions(options, ['stateId']);

    this.options = _.extend({}, _.result(this, 'options'), { state: {} }, options);

    _.defaults(this.options.state, { id: _.result(this, 'stateId') });

    const args = Array.prototype.slice.call(arguments);
    args[0] = this.options;

    Component.prototype.constructor.apply(this, args);
  },

  renderView(options) {
    const ViewClass = this._getViewClass(options);

    const viewOptions = this.mixinOptions(options);

    const view = this.buildView(ViewClass, viewOptions);

    // Attach current built view to component
    this.currentView = view;

    // ViewEventMixin
    this._proxyViewEvents(view);

    this.triggerMethod('before:render:view', view);

    // _shouldDestroy is flag that prevents the Component from being
    // destroyed if the region is emptied by Component itself.
    this._shouldDestroy = false;

    this.showView(view);

    this._shouldDestroy = true;

    this.triggerMethod('render:view', view);

    return this;
  },
});
