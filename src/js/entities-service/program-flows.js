import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/program-flows';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'programFlows:model': 'getModel',
    'programFlows:collection': 'getCollection',
    'fetch:programFlows:model': 'fetchCachedModel',
    'fetch:programFlows:collection': 'fetchProgramFlows',
  },
  fetchProgramFlows(filter = {}) {
    const data = { filter };

    return this.fetchCollection({ data });
  },
});

export default new Entity();
