import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'programs';

const _Model = BaseModel.extend({
  type: TYPE,
  validate({ name }) {
    if (!name) return 'Program name required';
  },
  urlRoot: '/api/programs',
});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  url: '/api/programs',
  model: Model,
});

export {
  Model,
  _Model,
  Collection,
};
