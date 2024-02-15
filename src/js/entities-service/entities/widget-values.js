import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'widget-values';

const _Model = BaseModel.extend({
  type: TYPE,
});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  model: Model,
});

export {
  _Model,
  Model,
  Collection,
};
