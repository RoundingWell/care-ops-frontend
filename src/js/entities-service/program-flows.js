import { result } from 'underscore';
import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/program-flows';

import { PROGRAM_BEHAVIORS } from 'js/static';

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
  fetchProgramFlows(behavior = PROGRAM_BEHAVIORS.STANDARD) {
    const collection = new this.Entity.Collection();

    const url = `${ result(collection, 'url') }?filter[behavior]=${ behavior }`;

    return collection.fetch({ url });
  },
});

export default new Entity();
