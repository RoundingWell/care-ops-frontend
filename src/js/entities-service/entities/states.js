import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

import { STATE_STATUS } from 'js/static';

const TYPE = 'states';

const _Model = BaseModel.extend({
  type: TYPE,
  isDone() {
    return this.get('status') === STATE_STATUS.DONE;
  },
});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  url: '/api/states',
  model: Model,
});

export {
  _Model,
  Model,
  Collection,
};
