import { result } from 'underscore';
import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/program-actions';

import { PROGRAM_BEHAVIORS } from 'js/static';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'programActions:model': 'getModel',
    'programActions:collection': 'getCollection',
    'fetch:programActions:model': 'fetchModel',
    'fetch:programActions:collection:byProgram': 'fetchProgramActionsByProgram',
    'fetch:programActions:collection': 'fetchProgramActions',
    'fetch:programActions:collection:byProgramFlow': 'fetchProgramActionsByFlow',
  },
  fetchProgramActionsByProgram({ programId }) {
    const url = `/api/programs/${ programId }/relationships/actions`;

    return this.fetchCollection({ url });
  },
  fetchProgramActions(behavior = PROGRAM_BEHAVIORS.STANDARD) {
    const collection = new this.Entity.Collection();

    const url = `${ result(collection, 'url') }?filter[behavior]=${ behavior }`;

    return collection.fetch({ url });
  },
  fetchProgramActionsByFlow(flowId, options) {
    const collection = new Collection([], { flowId });

    return collection.fetch(options);
  },
});

export default new Entity();
