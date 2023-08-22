import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/flows';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'flows:model': 'getModel',
    'flows:collection': 'getCollection',
    'fetch:flows:model': 'fetchFlow',
    'fetch:flows:collection': 'fetchCollection',
    'fetch:flows:collection:byPatient': 'fetchFlowsByPatient',
  },
  fetchFlow(id) {
    const include = [
      'program-flow',
      'program-flow.program',
      'program-flow.program-actions',
    ].join();
    return this.fetchModel(id, { data: { include } });
  },
  fetchFlowsByPatient({ patientId, filter }) {
    const data = { filter };
    const url = `/api/patients/${ patientId }/relationships/flows`;

    return this.fetchCollection({ url, data });
  },
});

export default new Entity();
