import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/program-flows';

import { PUBLISH_STATE_STATUS } from 'js/static';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'programFlows:model': 'getModel',
    'programFlows:collection': 'getCollection',
    'fetch:programFlows:model': 'fetchCachedModel',
    'fetch:programFlows:collection:byProgram': 'fetchProgramFlowsByProgram',
    'fetch:programFlows:collection': 'fetchProgramFlows',
    'fetch:programFlows:model:byPatientFlow': 'fetchProgramFlowByPatientFlow',
  },
  fetchProgramFlowsByProgram({ programId }) {
    const url = `/api/programs/${ programId }/relationships/flows`;

    return this.fetchCollection({ url });
  },
  fetchProgramFlows({ filter = { status: PUBLISH_STATE_STATUS.PUBLISHED } } = {}) {
    const data = { filter };
    return this.fetchCollection({ data });
  },
  fetchProgramFlowByPatientFlow(patientFlowId) {
    const data = { include: 'program-actions' };
    const url = `/api/flows/${ patientFlowId }/program-flow`;
    return this.fetchModel(patientFlowId, { data, url });
  },
});

export default new Entity();
