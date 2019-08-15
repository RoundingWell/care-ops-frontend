import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'roles';

const _Model = BaseModel.extend({
  type: TYPE,
  urlRoot: '/api/roles',
});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  url: '/api/roles',
  model: Model,
});

export {
  _Model,
  Model,
  Collection,
};
