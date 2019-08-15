import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/patients';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'patients:model': 'getModel',
    'patients:collection': 'getCollection',
    'fetch:patients:model': 'fetchPatient',
    'fetch:patients:collection': 'fetchPatients',
  },
  fetchPatient(id) {
    const data = { include: 'patient-fields' };

    return this.fetchModel(id, { data });
  },
  fetchPatients({ groupId }) {
    const filter = { group: groupId };

    return this.fetchCollection({ data: { filter } });
  },
});

export default new Entity();
