import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/actions';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'actions:model': 'getModel',
    'actions:collection': 'getCollection',
    'fetch:actions:model': 'fetchCachedModel',
    'fetch:actions:collection': 'fetchActions',
    'fetch:patientActions:collection': 'fetchPatientActions',
  },
  fetchActions({ filter }) {
    const data = { include: 'patient', filter };

    return this.fetchCollection({ data });
  },
  fetchPatientActions({ patient, filter }) {
    const data = { filter };
    const url = `${ patient.url() }/relationships/actions`;

    return this.fetchCollection({ url, data });
  },
});

export default new Entity();
