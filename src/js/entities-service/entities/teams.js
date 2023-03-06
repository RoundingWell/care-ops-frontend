import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'teams';

const _Model = BaseModel.extend({
  type: TYPE,
  urlRoot: '/api/teams',
});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  url: '/api/teams',
  model: Model,
  comparator: 'name',
});

export {
  _Model,
  Model,
  Collection,
};
