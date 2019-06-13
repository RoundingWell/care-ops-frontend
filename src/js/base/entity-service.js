import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';
import Radio from 'backbone.radio';
import { MnObject } from 'marionette';

export default MnObject.extend({
  channelName: 'entities',

  Entity: Backbone,

  constructor(options) {
    this.mergeOptions(options, ['Entity']);

    MnObject.apply(this, arguments);
  },
  getCollection(models, options = {}) {
    if (options.parse) {
      models = this.Entity.Collection.prototype.parse(models);
    }

    return new this.Entity.Collection(models, options);
  },
  getCollectionClone(models, options) {
    const collection = this.getCollection(models, options);

    const CloneCollection = this.Entity.Collection.extend({
      model: this.Entity._Model,
    });

    models = collection.map(function(model) {
      return _.clone(model.attributes);
    });

    return new CloneCollection(models, options);
  },
  getModel(attrs, options) {
    return new this.Entity.Model(attrs, options);
  },
  fetchCollection(options) {
    const d = $.Deferred();

    const ajaxAuth = Radio.request('auth', 'ajaxAuth');

    const collection = new this.Entity.Collection();

    collection.fetch(_.extend({
      success() {
        d.resolve.apply(d, arguments);
      },
      error() {
        d.reject.apply(d, arguments);
      },
    }, ajaxAuth, options));

    return d;
  },
  fetchModel(modelId, options) {
    const d = $.Deferred();

    const ajaxAuth = Radio.request('auth', 'ajaxAuth');

    const model = new this.Entity.Model({ id: modelId });

    model.fetch(_.extend({
      success() {
        d.resolve.apply(d, arguments);
      },
      error() {
        d.reject.apply(d, arguments);
      },
    }, ajaxAuth, options));

    return d;
  },
});

