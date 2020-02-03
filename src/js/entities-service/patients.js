import Radio from 'backbone.radio';

import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/patients';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'patients:model': 'getModel',
    'fetch:patients:model': 'fetchModel',
    'fetch:patients:model:byAction': 'fetchPatientByAction',
    'fetch:patients:model:byFlow': 'fetchPatientByFlow',
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
