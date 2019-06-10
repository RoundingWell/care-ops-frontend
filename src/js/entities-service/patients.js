import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/patients';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'patients:model': 'getModel',
    'patients:collection': 'getCollection',
    'fetch:patient:model': 'fetchPatient',
  },
  fetchPatient(id) {
    const include = [
      'groups',
      'patient-fields',
    ].join(',');

    const data = { include };

    return this.fetchModel(id, { data });
  },
});

export default new Entity();
