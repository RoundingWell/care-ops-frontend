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
    const collection = new this.Entity.Collection();

    return collection.fetch(options);
  },
  fetchCachedModel(modelId, options) {
    const model = new this.Entity.Model({ id: modelId });

    // Return cached object and refresh cache
    if (model.isCached()) {
      model.fetch();

      return model;
    }

    return this.fetchModel(modelId, options);
  },
  fetchModel(modelId, options) {
    const model = new this.Entity.Model({ id: modelId });

    return model.fetch(options);
  },
});

