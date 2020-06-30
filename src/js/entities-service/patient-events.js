import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/patient-events';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'patientEvents:model': 'getModel',
    'fetch:patientEvents:collection': 'fetchPatientEvents',
  },
  fetchPatientEvents({ patientId, filter }) {
    const url = `/api/patient/${ patientId }/relationships/events?`;
    return this.fetchCollection({
      url,
      data: { filter },
    });
  },
});

export default new Entity();
