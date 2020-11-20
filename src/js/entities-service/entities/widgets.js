import { uniqueId } from 'underscore';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'widgets';

const _Model = BaseModel.extend({
  type: TYPE,
});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  url: '/api/widgets',
  model: Model,
  modelId(attr) {
    return uniqueId(`${ attr.id }-`);
  },
});

export {
  _Model,
  Model,
  Collection,
};
