import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'forms';

const _Model = BaseModel.extend({
  type: TYPE,
  urlRoot: '/api/forms',
});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  url: '/api/forms',
  model: Model,
  comparator: 'name',
});

export {
  _Model,
  Model,
  Collection,
};
