import Radio from 'backbone.radio';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'clinicians';

const _Model = BaseModel.extend({
  type: TYPE,
  urlRoot: '/api/clinicians',

  getGroups() {
    return Radio.request('entities', 'groups:collection', this.get('_groups'));
  },
  getRole() {
    return Radio.request('entities', 'roles:model', this.get('_role'));
  },

});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  url: '/api/clinicians',
  model: Model,
});

export {
  _Model,
  Model,
  Collection,
};
