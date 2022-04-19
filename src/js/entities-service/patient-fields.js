import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/patient-fields';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'patientFields:model': 'getModel',
    'patientFields:collection': 'getCollection',
    'fetch:patientFields:model': 'fetchPatientField',
  },
  fetchPatientField(patientId, fieldName) {
    const url = `/api/patients/${ patientId }/fields/${ fieldName }`;

    return this.fetchModel(fieldName, { url, abort: false }).then(field => {
      // NOTE: hydrate store now that the id is known
      this.getModel(field.attributes);
    });
  },
});

export default new Entity();
