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
  setDue(date) {
    if (!date) {
      return this.set({ due_date: null });
    }
    return this.set({ due_date: date.format('YYYY-MM-DD') });
  },
  saveDue(date) {
    if (!date) {
      return this.patch({ due_date: null });
    }
    return this.patch({ due_date: date.format('YYYY-MM-DD') });
  },
  saveState(stateId) {
    return this.patch({ _state: stateId }, {
      relationships: {
        state: this.toRelation(stateId, 'states'),
      },
    });
  },
  saveClinician(clinician) {
    return this.patch({ _clinician: clinician.id }, {
      relationships: {
        clinician: this.toRelation(clinician.id, 'clinicians'),
      },
    });
  },
  saveRole(role) {
    return this.patch({ _role: role.id }, {
      relationships: {
        role: this.toRelation(role.id, 'roles'),
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
