import { map } from 'underscore';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'tags';

const _Model = BaseModel.extend({
  type: TYPE,
  idAttribute: 'text',
});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  url: '/api/tags',
  model: Model,
  parse(response) {
    return map(response.data, tag => {
      return { text: tag };
    });
  },
  comparator: 'text',
});

export {
  _Model,
  Model,
  Collection,
};
