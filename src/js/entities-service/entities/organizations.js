import Store from 'backbone.store';
import Radio from 'backbone.radio';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'organizations';

const _Model = BaseModel.extend({
  type: TYPE,
  urlRoot: '/api/organizations',
  getGroups() {
    return Radio.request('entities', 'groups:collection', this.get('_groups'));
  },
  getRoles() {
    return Radio.request('entities', 'roles:collection', this.get('_roles'));
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
