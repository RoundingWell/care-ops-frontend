import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/patient';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'patient:model': 'getModel',
    'patient:collection': 'getCollection',
    'fetch:patient:model': 'fetchPatient',
  },
  fetchPatient(id) {
    const include = [
      'factor',
      'follower',
      'groups',
      'patient-fields',
      'program',
    ].join(',');

    const data = { include };

    return this.fetchModel(id, { data });
  },
});

export default new Entity();
