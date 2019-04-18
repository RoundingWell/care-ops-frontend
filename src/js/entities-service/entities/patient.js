import _ from 'underscore';
import Radio from 'backbone.radio';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

import { BASE_URL } from 'js/config';

const TYPE = 'patient';

const _Model = BaseModel.extend({
  type: TYPE,
  urlRoot() {
    return `${ BASE_URL }patients`;
  },
  getProgram() {
    if (!this.get('_program')) return;

    return Radio.request('entities', 'program:model', { id: this.get('_program') });
  },
  getGroups() {
    return Radio.request('entities', 'group:collection', this.get('_groups'));
  },
  getFields() {
    return Radio.request('entities', 'patientField:collection', this.get('_patient_fields'));
  },
  getFollower() {
    if (!this.get('_follower')) return;

    return Radio.request('entities', 'clinician:model', { id: this.get('_follower') });
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
      attributes: {
        ccm_enabled: attrs.ccm_enabled,
      },
      relationships: {
        factor: this.toRelation(attrs._factor, 'factor'),
        program: this.toRelation(attrs._program, 'program'),
      },
    });
  },
  saveCareTeam(attrs) {
    return this.patch(attrs, {
      relationships: {
        follower: this.toRelation(attrs._follower, 'clinician'),
      },
    });
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
