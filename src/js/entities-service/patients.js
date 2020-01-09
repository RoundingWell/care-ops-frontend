import Radio from 'backbone.radio';

import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/patients';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'patients:model': 'getModel',
    'patients:collection': 'getCollection',
    'fetch:patients:model': 'fetchModel',
    'fetch:patients:collection': 'fetchPatients',
    'fetch:patients:model:byAction': 'fetchPatientByAction',
    'fetch:patients:model:byFlow': 'fetchPatientByFlow',
  },
  fetchPatients({ groupId }) {
    const filter = { group: groupId };

    return this.fetchCollection({ data: { filter } });
  },
  fetchPatientByAction(actionId) {
    const patient = Radio.request('entities', 'patients:model');

    return patient.fetch({ url: `/api/actions/${ actionId }/patient` });
  },
  fetchPatientByFlow(flowId) {
    const patient = Radio.request('entities', 'patients:model');

    return patient.fetch({ url: `/api/flows/${ flowId }/patient` });
  },
});

export default new Entity();
