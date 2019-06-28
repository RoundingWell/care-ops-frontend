import Radio from 'backbone.radio';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'actions';

const _Model = BaseModel.extend({
  type: TYPE,
  getClinician() {
    return Radio.request('entities', 'clinicians:model', this.get('_clinician'));
  },
  getPatient() {
    return Radio.request('entities', 'patient:model', this.get('_patient'));
  },
  getRole() {
    return Radio.request('entities', 'role:model', this.get('_role'));
  },
});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  url: '/api/actions',
  model: Model,
});

export {
  _Model,
  Model,
  Collection,
};
