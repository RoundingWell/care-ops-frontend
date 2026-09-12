import { extend, isFunction, result } from 'underscore';
import Backbone from 'backbone';
import { Application, View } from 'marionette';

import StateMixin from './state';
import ViewEventsMixin from './view-events';

const classOptions = [
  'regionOptions',
  'ViewClass',
  'viewEventPrefix',
  'viewEvents',
  'viewTriggers',
  'viewOptions',
];

const Component = Application.extend({
  ViewClass: View,

  constructor: function(options = {}) {
    this.mergeOptions(options, classOptions);
    this.options = extend({}, result(this, 'options'), options);
    this._buildEventProxies();
    this._initState(options);

    Application.call(this, options);

    this.delegateStateEvents();
  },

  showIn(region, viewOptions, regionOptions) {
    this._region = region;
    this.show(viewOptions, regionOptions);

    return this;
  },

  show(viewOptions, regionOptions) {
    const region = this.getRegion();

    if (!region) throw new Error('Component has no defined region.');

    const view = this._getView(viewOptions);

    this.stopListening(region.currentView, 'destroy', this.destroy);
    this.triggerMethod('before:show', this, view, viewOptions, regionOptions);
    this.showView(view, this.mixinRegionOptions(regionOptions));
    this.listenTo(region.currentView, 'destroy', this.destroy);
    this.triggerMethod('show', this, view, viewOptions, regionOptions);

    return this;
  },

  empty() {
    const region = this.getRegion();

    if (!region) throw new Error('Component has no defined region.');

    this.stopListening(region.currentView, 'destroy', this.destroy);
    region.empty();

    return this;
  },

  mixinRegionOptions(options) {
    return extend({}, result(this, 'regionOptions'), options);
  },

  _getView(options) {
    const ViewClass = this._getViewClass(options);
    const view = this.buildView(ViewClass, this.mixinViewOptions(options));

    this._proxyViewEvents(view);

    return view;
  },

  _getViewClass(options = {}) {
    const ViewClass = this.ViewClass;

    if (ViewClass === Backbone.View || ViewClass.prototype instanceof Backbone.View) return ViewClass;
    if (isFunction(ViewClass)) return ViewClass.call(this, options);

    throw new Error('"ViewClass" must be a view class or a function that returns a view class');
  },

  mixinViewOptions(options) {
    return extend({ state: this.getState().attributes }, result(this, 'viewOptions'), options);
  },

  buildView(ViewClass, viewOptions) {
    return new ViewClass(viewOptions);
  },

  destroy() {
    if (this._isDestroyed) return this;

    const region = this.getRegion();

    if (region) region.empty();

    Application.prototype.destroy.apply(this, arguments);

    return this;
  },
}, {
  setRegion(region) {
    this.prototype.region = region;
  },
});

Object.assign(Component.prototype, StateMixin, ViewEventsMixin);

export default Component;
