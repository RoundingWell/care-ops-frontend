import { bind, extend, isArray, noop, result, uniqueId } from 'underscore';
import { Application } from 'marionette';

import handleErrors from 'js/utils/handle-errors';
import ChildAppsMixin from './child-apps';
import RunningEventsMixin from './running-events';
import StateMixin from './state';
import ViewEventsMixin from './view-events';

const classOptions = [
  'startWithParent',
  'restartWithParent',
  'stopWithParent',
  'startAfterInitialized',
  'preventDestroy',
  'StateModel',
  'stateEvents',
  'viewEventPrefix',
  'viewEvents',
  'viewTriggers',
];

const App = Application.extend({
  _isRunning: false,
  _isRestarting: false,
  preventDestroy: false,
  startAfterInitialized: false,
  startWithParent: false,
  stopWithParent: true,
  restartWithParent: null,

  constructor: function(options = {}) {
    this.mergeOptions(options, classOptions);
    this.options = extend({}, result(this, 'options'), options);
    this._initChildApps(options);

    Application.call(this, options);

    if (result(this, 'startAfterInitialized')) this.start(options);
  },

  _ensureAppIsIntact() {
    if (this._isDestroyed) throw new Error('App has already been destroyed and cannot be used.');
  },

  start(options = {}) {
    this._ensureAppIsIntact();
    if (this._isRunning) return this;

    if (options.region) this.setRegion(options.region);
    if (options.view) this.setView(options.view);

    this._initState(options);
    this._buildEventProxies();
    this.triggerMethod('before:start', options);
    this._isRunning = true;
    this._bindRunningEvents();
    this.triggerStart(options);

    return this;
  },

  _bindRunningEvents() {
    if (this._region) this._regionEventMonitor();
    if (this._view) this._proxyViewEvents(this._view);

    this.delegateStateEvents();
  },

  restart(options) {
    const state = this.getState().attributes;

    this._isRestarting = true;
    this.stop().start(extend({ state }, options));
    this._isRestarting = false;

    return this;
  },

  finallyStart() {
    this._startChildApps();
    this.triggerMethod('start', ...arguments);
  },

  triggerStart(options) {
    this._isLoading = true;

    this._fetchId = uniqueId('fetch');
    const triggerSyncData = bind(this.triggerMethod, this, 'sync:data', this._fetchId, options);
    const triggerFail = bind(this.triggerSyncFail, this, this._fetchId, options);
    const promise = this.beforeStart(options);

    if (!promise) {
      triggerSyncData();
      return;
    }

    Promise.all(isArray(promise) ? promise : [promise])
      .then(triggerSyncData)
      .catch(triggerFail);
  },
  beforeStart: noop,
  onSyncData(fetchId, options, args = []) {
    if (!this._isRunning || this._fetchId !== fetchId) return;

    this._isLoading = false;

    this.finallyStart.call(this, options, ...args);
  },
  triggerSyncFail(fetchId, options, ...args) {
    if (!this._isRunning || this._fetchId !== fetchId) return;

    this._isLoading = false;

    this.triggerMethod('fail', options, ...args);
  },
  onFail(options, error) {
    handleErrors(error);
  },
  isRunning() {
    return this._isRunning && !this.isLoading();
  },
  _isLoading: false,
  isLoading() {
    return this._isLoading;
  },

  isRestarting() {
    return this._isRestarting;
  },

  stop(options) {
    if (!this._isRunning) return this;

    this.triggerMethod('before:stop', options);
    this._stopChildApps();
    this._isRunning = false;
    this.triggerMethod('stop', options);
    this._stopRunningListeners();
    this._stopRunningEvents();

    return this;
  },

  destroy() {
    if (this._isDestroyed) return this;

    this.stop();
    this._removeView();
    this._destroyChildApps();
    Application.prototype.destroy.apply(this, arguments);

    return this;
  },

  setRegion(region) {
    if (this._region) this.stopListening(this._region);

    this._region = region;
    if (region.currentView) this.setView(region.currentView);
    if (this._isRunning) this._regionEventMonitor();

    return region;
  },

  _regionEventMonitor() {
    this.listenTo(this._region, {
      'before:show': this._onBeforeShow,
      'empty': this._onEmpty,
    });
  },

  _onBeforeShow(region, view) {
    this.setView(view);
  },

  _onEmpty(region, view) {
    if (view === this._view) this._removeView();
  },

  _removeView() {
    if (!this._view) return;

    this.stopListening(this._view);
    delete this._view;
  },

  getRegion(regionName) {
    if (!regionName) return this._region;

    return this.getView().getRegion(regionName);
  },

  setView(view) {
    if (this._view === view) return view;
    if (this._view) this.stopListening(this._view);

    this._view = view;
    if (this._isRunning) this._proxyViewEvents(view);
    this._listenTo(this._view, 'destroy', this._removeView);

    return view;
  },

  getView() {
    return this._view || (this._region && this._region.currentView);
  },

  showView(view = this._view, ...args) {
    const region = this.getRegion();

    region.show(view, ...args);

    if (!this.isRunning()) this.setView(region.currentView);

    return view;
  },

  showChildView(regionName, view, ...args) {
    this.getView().showChildView(regionName, view, ...args);

    return view;
  },

  getChildView(regionName) {
    return this.getView().getChildView(regionName);
  },
});

Object.assign(
  App.prototype,
  StateMixin,
  ChildAppsMixin,
  RunningEventsMixin,
  ViewEventsMixin,
);

export default App;
