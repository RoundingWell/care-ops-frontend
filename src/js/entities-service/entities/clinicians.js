import Radio from 'backbone.radio';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'clinicians';

const _Model = BaseModel.extend({
  type: TYPE,
  urlRoot: '/api/clinicians',

  getOrganization() {
    return Radio.request('entities', 'organizations:model', this.get('_organization'));
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
