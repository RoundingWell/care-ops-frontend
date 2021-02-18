import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'form-responses';

const _Model = BaseModel.extend({
  type: TYPE,
  urlRoot: '/api/form-responses',
  saveAll() {
    const attrs = this.attributes;

    const relationships = {
      'form': this.toRelation(attrs._form, 'forms'),
      'patient': this.toRelation(attrs._patient, 'patients'),
      'action': this.toRelation(attrs._action, 'patient-actions'),
    };

    return this.save(attrs, { relationships }, { wait: true });
  },
});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  url: '/api/form-responses',
  model: Model,
});

export {
  _Model,
  Model,
  Collection,
};
