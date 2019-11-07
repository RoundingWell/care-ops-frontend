import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/actions';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'actions:model': 'getModel',
    'actions:collection': 'getCollection',
    'fetch:actions:model': 'fetchCachedModel',
    'fetch:actions:collection': 'fetchActions',
    'fetch:actions:collection:byPatient': 'fetchActionsByPatient',
  },
  fetchActions({ filter }) {
    const data = { filter };

    return this.fetchCollection({ data });
  },
  fetchActionsByPatient({ patientId, filter }) {
    const data = { filter };
    const url = `/api/patients/${ patientId }/relationships/actions`;

    return this.fetchCollection({ url, data });
  },
});

export default new Entity();
