import _ from 'underscore';
import moment from 'moment';
import Radio from 'backbone.radio';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'program-actions';

const _Model = BaseModel.extend({
  urlRoot() {
    if (this.isNew()) return `/api/programs/${ this.get('_program') }/relationships/actions`;

    return '/api/program-actions';
  },
  type: TYPE,
  validate({ name }) {
    if (!name) return 'Action name required';
  },
  getAction(patientId) {
    const currentUser = Radio.request('bootstrap', 'currentUser');
    const currentOrg = Radio.request('bootstrap', 'currentOrg');
    const states = currentOrg.getStates();

    const action = this.pick('name', 'details', '_role', '_program');
    const dueDay = this.get('days_until_due');
    const dueDate = (dueDay === null) ? null : moment().add(dueDay, 'days').format('YYYY-MM-DD');

    _.extend(action, {
      _patient: patientId,
      _state: states.at(0).id,
      _clinician: action._role ? null : currentUser.id,
      duration: 0,
      due_date: dueDate,
    });

    return Radio.request('entities', 'actions:model', action);
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
  saveAll(attrs = this.attributes) {
    const relationships = {
      role: this.toRelation(attrs._role, 'roles'),
    };

    return this.save(attrs, { relationships }, { wait: true });
  },
});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  url: '/api/program-actions',
  model: Model,
});

export {
  _Model,
  Model,
  Collection,
};
