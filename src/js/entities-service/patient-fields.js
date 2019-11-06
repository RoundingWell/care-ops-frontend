import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/patient-fields';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'patientFields:model': 'getModel',
    'patientFields:collection': 'getCollection',
    'fetch:patientFields:collection': 'fetchPatientFields',
  },
  fetchPatientFields(patientId) {
    const url = `/api/patients/${ patientId }/fields`;

    return this.fetchCollection({ url });
  },
});

export default new Entity();
