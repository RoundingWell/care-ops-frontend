import _ from 'underscore';
import Radio from 'backbone.radio';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'flows';

const _Model = BaseModel.extend({
  urlRoot: '/api/flows',
  type: TYPE,
  validate({ name }) {
    if (!_.trim(name)) return 'Flow name required';
  },
  getRole() {
    const roleId = this.get('_role');
    if (!roleId) return;
    return Radio.request('entities', 'roles:model', roleId);
  },
  saveRole(role) {
    return this.save({ _role: role.id }, {
      relationships: {
        role: this.toRelation(role.id, role.type),
      },
    });
  },
  saveAll(attrs) {
    attrs = _.extend({}, this.attributes, attrs);
    const relationships = {
      role: this.toRelation(attrs._role, 'roles'),
      state: this.toRelation(attrs._state, 'states'),
    };

    return this.save(attrs, { relationships }, { wait: true });
  },
});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  url: '/api/flows',
  model: Model,
});

export {
  _Model,
  Model,
  Collection,
};
