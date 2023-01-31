import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'settings';

const _Model = BaseModel.extend({
  type: TYPE,
  urlRoot: '/api/settings',
});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  url: '/api/settings',
  model: Model,
});

export {
  _Model,
  Model,
  Collection,
};
