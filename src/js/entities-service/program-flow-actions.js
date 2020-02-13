import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/program-flow-actions';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'programFlowActions:model': 'getModel',
    'programFlowActions:collection': 'getCollection',
    'fetch:programFlowActions:collection': 'fetchProgramFlowActionsCollection',
  },
  fetchProgramFlowActionsCollection(flowId, options) {
    const collection = new Collection([], { flowId });

    return collection.fetch(options);
  },
});

export default new Entity();
