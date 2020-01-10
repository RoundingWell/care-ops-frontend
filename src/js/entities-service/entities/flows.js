import _ from 'underscore';
import Radio from 'backbone.radio';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'flows';

const _Model = BaseModel.extend({
  urlRoot() {
    if (this.isNew()) return `/api/patients/${ this.get('_patient') }/relationships/flows`;

    return '/api/flows';
  },
  type: TYPE,
  getOwner() {
    return this.getClinician() || this.getRole();
  },
  getClinician() {
    const clinicianId = this.get('_clinician');
    if (!clinicianId) return;
    return Radio.request('entities', 'clinicians:model', clinicianId);
  },
  getRole() {
    const roleId = this.get('_role');
    if (!roleId) return;
    return Radio.request('entities', 'roles:model', roleId);
  },
  isDone() {
    const state = Radio.request('entities', 'states:model', this.get('_state'));
    return state.get('status') === 'done';
  },
  saveState(state) {
    return this.save({ _state: state.id }, {
      relationships: {
        state: this.toRelation(state),
      },
    });
  },
  saveClinician(clinician) {
    return this.save({ _clinician: clinician.id, _role: null }, {
      relationships: {
        clinician: this.toRelation(clinician),
      },
    });
  },
  saveRole(role) {
    return this.save({ _role: role.id, _clinician: null }, {
      relationships: {
        role: this.toRelation(role),
      },
    });
  },
  saveOwner(owner) {
    if (owner.type === 'clinicians') {
      return this.saveClinician(owner);
    }

    return this.saveRole(owner);
  },
  saveAll(attrs) {
    attrs = _.extend({}, this.attributes, attrs);

    const relationships = {
      'role': this.toRelation(attrs._role, 'roles'),
      'state': this.toRelation(attrs._state, 'states'),
      'clinician': this.toRelation(attrs._clinician, 'clinicians'),
      'program-flow': this.toRelation(attrs._program_flow, 'program-flows'),
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
