import Store from 'backbone.store';
import BaseModel from 'js/base/model';

const TYPE = 'organizations';

const _Model = BaseModel.extend({
  getStates() {
    return this.get('states').clone();
  },
  getRoles() {
    return this.get('roles').clone();
  },
  type: TYPE,
});

const Model = Store(_Model, TYPE);

export {
  _Model,
  Model,
};
