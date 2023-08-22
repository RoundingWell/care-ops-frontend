import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/actions';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'actions:model': 'getModel',
    'actions:collection': 'getCollection',
    'fetch:actions:model': 'fetchAction',
    'fetch:actions:collection': 'fetchActions',
    'fetch:actions:collection:byPatient': 'fetchActionsByPatient',
    'fetch:actions:collection:byFlow': 'fetchActionsByFlow',
  },
  fetchAction(id) {
    const include = [
      'program-action.program',
      'flow.program-flow.program',
    ].join();
    return this.fetchModel(id, { data: { include } });
  },
  fetchActions({ filter, include, fields }) {
    const data = { filter, include, fields };

    return this.fetchCollection({ data });
  },
  fetchActionsByPatient({ patientId, filter }) {
    const data = { filter };
    const url = `/api/patients/${ patientId }/relationships/actions`;

    return this.fetchCollection({ url, data });
  },
  fetchActionsByFlow(flowId) {
    const url = `/api/flows/${ flowId }/relationships/actions`;

    return this.fetchCollection({ url });
  },
});

export default new Entity();
