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
  getOrganization() {
    return Radio.request('entities', 'organizations:model', this.getGroups().at(0).get('_organization'));
  },
  getRole() {
    return Radio.request('entities', 'roles:model', this.get('_role'));
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
