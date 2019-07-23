import Radio from 'backbone.radio';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'groups';

const _Model = BaseModel.extend({
  type: TYPE,
  urlRoot: '/api/groups',
  getClinicians() {
    return Radio.request('entities', 'clinicians:collection', this.get('_clinicians'));
  },
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
