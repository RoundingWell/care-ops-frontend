import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/clinicians';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'clinicians:model': 'getModel',
    'clinicians:collection': 'getCollection',
    'fetch:clinician:model': 'fetchClinician',
  },
  fetchClinician(id) {
    const include = [
      'role',
    ];

    const data = { include };

    return this.fetchModel(id, { data });
  },
});

export default new Entity();
