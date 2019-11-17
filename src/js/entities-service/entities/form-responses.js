import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'form-responses';

const _Model = BaseModel.extend({
  type: TYPE,
  urlRoot: '/api/form-responses',
});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  url: '/api/form-responses',
  model: Model,
});

export {
  _Model,
  Model,
  Collection,
};
