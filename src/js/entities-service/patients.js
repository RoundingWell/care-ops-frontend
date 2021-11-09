import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/patients';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'patients:model': 'getModel',
    'patients:collection': 'getCollection',
    'fetch:patients:model': 'fetchModel',
    'fetch:patients:model:byAction': 'fetchPatientByAction',
    'fetch:patients:model:byFlow': 'fetchPatientByFlow',
  },
  fetchPatientByAction(actionId) {
    return this.fetchBy(`/api/actions/${ actionId }/patient`);
  },
  fetchPatientByFlow(flowId) {
    return this.fetchBy(`/api/flows/${ flowId }/patient`);
  },
});

export default new Entity();
