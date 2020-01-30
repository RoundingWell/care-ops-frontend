import BaseEntity from 'js/base/entity-service';
import { Model, Collection } from './entities/patient-search-results';

const Entity = BaseEntity.extend({
  Entity: { Model, Collection },
  radioRequests: {
    'searchPatients:collection': 'getCollection',
  },
});

export default new Entity();
