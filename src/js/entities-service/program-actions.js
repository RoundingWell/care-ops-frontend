import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/program-actions';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'programActions:model': 'getModel',
    'programActions:collection': 'getCollection',
    'fetch:programActions:model': 'fetchCachedModel',
    'fetch:programActions:collection:byProgram': 'fetchProgramActionsByProgram',
    'fetch:programActions:collection': 'fetchProgramActions',
    'fetch:programActions:collection:byProgramFlow': 'fetchProgramActionsByFlow',
  },
  fetchProgramActionsByProgram({ programId }) {
    const url = `/api/programs/${ programId }/relationships/actions`;

    return this.fetchCollection({ url });
  },
  fetchProgramActions({ filter = { status: 'published' } } = {}) {
    const data = { filter };
    return this.fetchCollection({ data });
  },
  fetchProgramActionsByFlow(flowId, options) {
    const collection = new Collection([], { flowId });

    return collection.fetch(options);
  },
});

export default new Entity();
