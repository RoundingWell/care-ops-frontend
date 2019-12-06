import _ from 'underscore';
import Radio from 'backbone.radio';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'program-flows';

const _Model = BaseModel.extend({
  urlRoot: '/api/program-flows',
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
        role: this.toRelation(role),
      },
    });
  },
});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  url: '/api/program-flows',
  model: Model,
});

export {
  _Model,
  Model,
  Collection,
};
