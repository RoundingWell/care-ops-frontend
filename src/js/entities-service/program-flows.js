import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/program-flows';

import { PUBLISH_STATE_STATUS } from 'js/static';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'programFlows:model': 'getModel',
    'programFlows:collection': 'getCollection',
    'fetch:programFlows:model': 'fetchModel',
    'fetch:programFlows:collection:byProgram': 'fetchProgramFlowsByProgram',
    'fetch:programFlows:collection': 'fetchProgramFlows',
  },
  fetchProgramFlowsByProgram({ programId }) {
    const url = `/api/programs/${ programId }/relationships/flows`;

    return this.fetchCollection({ url });
  },
  fetchProgramFlows({ filter = { status: PUBLISH_STATE_STATUS.PUBLISHED } } = {}) {
    const data = { filter };
    return this.fetchCollection({ data });
  },
});

export default new Entity();
