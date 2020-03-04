import _ from 'underscore';
import Backbone from 'backbone';
import { v4 as uuid } from 'uuid';

// NOTE: Assumes idAttribute is _always_ id
Backbone.Model.prototype.sync = function(method, model, options) {
  options = _.clone(options);

  if (method === 'create') {
    let data = options.data || options.attrs || model.toJSON(options);
    if (_.isString(data)) data = JSON.parse(data);
    data.data.id = uuid();
    options.data = JSON.stringify(data);
  }

  return Backbone.sync(method, model, options);
};
