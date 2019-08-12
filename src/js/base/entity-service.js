import $ from 'jquery';
import _ from 'underscore';
import Backbone from 'backbone';
import { MnObject } from 'marionette';

export default MnObject.extend({
  channelName: 'entities',

  Entity: Backbone,

  constructor(options) {
    this.mergeOptions(options, ['Entity']);

    MnObject.apply(this, arguments);
  },
  getCollection(models, options = {}) {
    return new this.Entity.Collection(models, options);
  },
  getModel(attrs, options) {
    if (attrs && !_.isObject(attrs)) attrs = { id: attrs };
    return new this.Entity.Model(attrs, options);
  },
  fetchCollection(options) {
    const d = $.Deferred();

    const collection = new this.Entity.Collection();

    collection.fetch(_.extend({
      success() {
        d.resolve.apply(d, arguments);
      },
      error() {
        d.reject.apply(d, arguments);
      },
    }, options));

    return d;
  },
  fetchCachedModel(modelId, options) {
    const model = new this.Entity.Model({ id: modelId });

    // Return cached object and refresh cache
    if (model.isCached()) {
      const d = $.Deferred();
      model.fetch();
      d.resolve(model);
      return d;
    }

    return this.fetchModel(modelId, options);
  },
  fetchModel(modelId, options) {
    const d = $.Deferred();

    const model = new this.Entity.Model({ id: modelId });

    model.fetch(_.extend({
      success() {
        d.resolve.apply(d, arguments);
      },
      error() {
        d.reject.apply(d, arguments);
      },
    }, options));

    return d;
  },
});

