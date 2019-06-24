import _ from 'underscore';
import Radio from 'backbone.radio';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'patients';

const _Model = BaseModel.extend({
  type: TYPE,
  urlRoot: '/api/patients',
  getProgram() {
    if (!this.get('_program')) return;

    return Radio.request('entities', 'programs:model', { id: this.get('_program') });
  },
  getGroups() {
    return Radio.request('entities', 'groups:collection', this.get('_groups'));
  },
  getFields() {
  },
  getFollower() {
    if (!this.get('_follower')) return;

    return Radio.request('entities', 'clinicians:model', { id: this.get('_follower') });
  },
  displayName() {
    const firstName = this.get('first_name');
    const lastName = this.get('last_name');

    return [firstName, lastName].join(' ');
  },
  isClinicianPendingRemoval({ id }) {
    const clinician = Radio.request('entities', 'clinician:model', { id });
    return clinician.getGroups().every(this.getPendingRemovalDate, this);
  },
  getPendingRemovalDate({ id }) {
    const group = this.getGroups().get(id);

    if (!group) return;

    return _.propertyOf(group.get('_meta'))('remove_at');
  },
  savePrograms(attrs) {
    return this.patch(attrs, {
      relationships: {
        factors: this.toRelation(attrs._factors, 'factors'),
        programs: this.toRelation(attrs._programs, 'programs'),
      },
    });
  },
  saveCareTeam(attrs) {
    return this.patch(attrs, {
      relationships: {
        follower: this.toRelation(attrs._follower, 'clinician'),
      },
    });
    return Radio.request('entities', 'patientFields:collection', this.get('_fields'));
  },
});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  model: Model,
});

export {
  Model,
  _Model,
  Collection,
};
