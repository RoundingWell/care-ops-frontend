import { isFunction, omit, result } from 'underscore';
import Backbone from 'backbone';

const classOptions = ['StateModel', 'stateEvents'];

const StateMixin = {
  StateModel: Backbone.Model,

  initState(options = {}) {
    this._initState(options);
    this.delegateStateEvents();

    return this;
  },

  _initState(options) {
    this.mergeOptions(options, classOptions);
    this._removeStateHandlers();

    const StateModel = this._getStateModel(options);

    this._stateModel = new StateModel(options.state);
    this.on('destroy', this._destroyState);
  },

  _getStateModel(options) {
    if (this.StateModel === Backbone.Model || this.StateModel.prototype instanceof Backbone.Model) {
      return this.StateModel;
    }

    if (isFunction(this.StateModel)) return this.StateModel.call(this, options);

    throw new Error('"StateModel" must be a model class or a function that returns a model class');
  },

  delegateStateEvents() {
    this.undelegateStateEvents();
    this.bindEvents(this._stateModel, result(this, 'stateEvents'));

    return this;
  },

  undelegateStateEvents() {
    this.unbindEvents(this._stateModel);

    return this;
  },

  _removeStateHandlers() {
    if (!this._stateModel) return;

    this.undelegateStateEvents();
    this._stateModel.stopListening();
    this.off('destroy', this._destroyState);
  },

  setState(...args) {
    return this._stateModel.set(...args);
  },

  resetStateDefaults() {
    return this._stateModel.set(result(this._stateModel, 'defaults'));
  },

  getState(attr) {
    if (!attr) return this._stateModel;

    return this._stateModel.get(...arguments);
  },

  toggleState(attr, value) {
    if (arguments.length > 1) return this._stateModel.set(attr, !!value);

    return this._stateModel.set(attr, !this._stateModel.get(attr));
  },

  hasState(attr) {
    return this._stateModel.has(attr);
  },

  _destroyState() {
    this._stateModel.stopListening();
  },
};

export function mixinState(ClassDefinition) {
  const stateMixin = ClassDefinition.prototype.StateModel ?
    omit(StateMixin, 'StateModel') :
    StateMixin;

  Object.assign(ClassDefinition.prototype, stateMixin);
}

export default StateMixin;
