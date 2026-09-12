import { clone, each, extend, isFunction, isObject, omit, partial, pick, result } from 'underscore';

const classOptions = ['childApps', 'childAppOptions'];

export default {
  _initChildApps(options = {}) {
    this._childApps = {};
    this.mergeOptions(options, classOptions);

    let childApps = this.childApps;

    if (isFunction(childApps)) childApps = childApps.call(this, options);
    if (childApps) this.addChildApps(childApps);
  },

  _getChildStartOptions(childApp) {
    const childOptions = childApp._childOptions || {};
    const options = { region: this.getRegion(childOptions.regionName) };

    each(childOptions.getOptions, option => {
      options[option] = this.getOption(option);
    });

    return options;
  },

  _startChildApp(childApp, options) {
    return childApp.start(extend(this._getChildStartOptions(childApp), options));
  },

  _shouldActWithRestart(childApp, action) {
    if (!this._isRestarting) return true;

    const restartWithParent = result(childApp, 'restartWithParent');

    if (restartWithParent === true) return true;
    if (restartWithParent !== false && result(childApp, action)) return true;
  },

  _startChildApps() {
    each(this._childApps, childApp => {
      if (!this._shouldActWithRestart(childApp, 'startWithParent')) return;
      if (!this._isRestarting && !result(childApp, 'startWithParent')) return;

      this._startChildApp(childApp);
    });
  },

  _stopChildApps() {
    each(this._childApps, childApp => {
      if (!this._shouldActWithRestart(childApp, 'stopWithParent')) return;
      if (!this._isRestarting && !result(childApp, 'stopWithParent')) return;

      childApp.stop();
    });
  },

  startChildApp(appName, options) {
    return this._startChildApp(this.getChildApp(appName), options);
  },

  stopChildApp(appName, options) {
    return this.getChildApp(appName).stop(options);
  },

  _destroyChildApps() {
    each(this._childApps, childApp => {
      if (!result(childApp, 'preventDestroy')) childApp.destroy();
    });
  },

  _buildAppFromObject(appConfig) {
    const options = omit(appConfig, 'AppClass', 'regionName', 'getOptions');
    const app = this.buildApp(appConfig.AppClass, options);

    app._childOptions = pick(appConfig, 'regionName', 'getOptions');

    return app;
  },

  _buildApp(AppClass, options) {
    if (isFunction(AppClass)) return this.buildApp(AppClass, options);
    if (isObject(AppClass)) return this._buildAppFromObject(AppClass);
  },

  buildApp(AppClass, options) {
    return new AppClass(extend({}, this.childAppOptions, options));
  },

  addChildApps(childApps) {
    each(childApps, (childApp, appName) => this.addChildApp(appName, childApp));
  },

  addChildApp(appName, AppClass, options) {
    if (this._childApps[appName]) {
      throw new Error(`A child App with name "${ appName }" has already been added.`);
    }

    const childApp = this._buildApp(AppClass, options);

    if (!childApp) throw new Error('App build failed. Incorrect configuration.');

    childApp._name = appName;
    this._childApps[appName] = childApp;
    childApp._on('destroy', partial(this._removeChildApp, appName), this);

    if (this.isRunning() && result(childApp, 'startWithParent')) this._startChildApp(childApp);

    return childApp;
  },

  getName() {
    return this._name;
  },

  getChildApps() {
    return clone(this._childApps);
  },

  getChildApp(appName) {
    return this._childApps[appName];
  },

  _removeChildApp(appName) {
    delete this._childApps[appName]._name;
    delete this._childApps[appName];
  },

  removeChildApps() {
    const childApps = this.getChildApps();

    each(this._childApps, (childApp, appName) => this.removeChildApp(appName));

    return childApps;
  },

  removeChildApp(appName, options = {}) {
    const childApp = this.getChildApp(appName);

    if (!childApp) return;

    if (options.preventDestroy || result(childApp, 'preventDestroy')) {
      this._removeChildApp(appName);
    } else {
      childApp.destroy();
    }

    return childApp;
  },
};
