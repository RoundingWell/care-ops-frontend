import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'reports';

const _Model = BaseModel.extend({
  type: TYPE,
  urlRoot: '/api/reports',
});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  url: '/api/reports',
  model: Model,
});

export {
  _Model,
  Model,
  Collection,
};
