import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/actions';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'actions:model': 'getModel',
    'actions:collection': 'getCollection',
    'fetch:actions:collection': 'fetchActions',
    'fetch:patientActions:collection': 'fetchPatientActions',
  },
  fetchActions() {
    const include = [
      'clinician',
      'patient',
      'events',
    ].join(',');

    const data = { include };

    return this.fetchCollection({ data });
  },
  fetchPatientActions(patient) {
    const url = `${ patient.url() }/relationships/actions`;
    const include = [
      'clinician',
      'events',
    ].join(',');

    const data = { include };

    return this.fetchCollection({ url, data });
  },
});

export default new Entity();
