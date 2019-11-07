import _ from 'underscore';
import Radio from 'backbone.radio';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'patient-actions';

const _Model = BaseModel.extend({
  urlRoot() {
    if (this.isNew()) return `/api/patients/${ this.get('_patient') }/relationships/actions`;

    return '/api/actions';
  },
  type: TYPE,
  validate({ name }) {
    if (!_.trim(name)) return 'Action name required';
  },
  getClinician() {
    const clinicianId = this.get('_clinician');
    if (!clinicianId) return;
    return Radio.request('entities', 'clinicians:model', clinicianId);
  },
  getPatient() {
    return Radio.request('entities', 'patients:model', this.get('_patient'));
  },
  getRole() {
    const roleId = this.get('_role');
    if (!roleId) return;
    return Radio.request('entities', 'roles:model', roleId);
  },
  getOwner() {
    return this.getClinician() || this.getRole();
  },
  isDone() {
    const state = Radio.request('entities', 'states:model', this.get('_state'));
    return state.get('status') === 'done';
  },
  saveDue(date) {
    if (!date) {
      return this.save({ due_date: null });
    }
    return this.save({ due_date: date.format('YYYY-MM-DD') });
  },
  saveState(state) {
    return this.save({ _state: state.id }, {
      relationships: {
        state: this.toRelation(state),
      },
    });
  },
  saveClinician(clinician) {
    return this.save({ _clinician: clinician.id }, {
      relationships: {
        clinician: this.toRelation(clinician),
      },
    });
  },
  saveRole(role) {
    return this.save({ _role: role.id }, {
      relationships: {
        role: this.toRelation(role),
      },
    });
  },
  saveOwner(owner) {
    if (owner.type === 'clinicians') {
      this.set({ _role: null });
      return this.saveClinician(owner);
    }

    this.set({ _clinician: null });
    return this.saveRole(owner);
  },
  saveAll(attrs = this.attributes) {
    const relationships = {
      role: this.toRelation(attrs._role, 'roles'),
      clinician: this.toRelation(attrs._clinician, 'clinicians'),
      state: this.toRelation(attrs._state, 'states'),
      program: this.toRelation(attrs._program, 'programs'),
    };

    return this.save(attrs, { relationships }, { wait: true });
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
