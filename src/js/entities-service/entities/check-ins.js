import Backbone from 'backbone';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'check-ins';

const _Model = BaseModel.extend({
  type: TYPE,
  urlRoot: '/api/check-ins',
  getContent() {
    return new Backbone.Collection(this.get('content'));
  },
  parseModel(data) {
    return data.checkin;
  },
});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  url: '/api/check-ins',
  model: Model,
});

export {
  _Model,
  Model,
  Collection,
};
