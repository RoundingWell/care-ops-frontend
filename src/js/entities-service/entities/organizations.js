import Store from 'backbone.store';
import BaseModel from 'js/base/model';

const TYPE = 'organizations';

const _Model = BaseModel.extend({
  getStates() {
    return this.get('states').clone();
  },
  getActiveRoles() {
    const roles = this.getRoles();

    roles.reset(roles.filter(role => {
      return role.hasClinicians();
    }));

    return roles;
  },
  getRoles() {
    return this.get('roles').clone();
  },
  getForms() {
    return this.get('forms').clone();
  },
  getSetting(id) {
    return this.get('settings').get(id);
  },
  type: TYPE,
});

const Model = Store(_Model, TYPE);

export {
  _Model,
  Model,
};
