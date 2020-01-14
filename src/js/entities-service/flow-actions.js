import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/flow-actions';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'flowActions:model': 'getModel',
    'flowActions:collection': 'getCollection',
    'fetch:flowActions:collection': 'fetchFlowActionsCollection',
  },
  fetchFlowActionsCollection(flowId, options) {
    const collection = new Collection({ flowId });

    return collection.fetch(options);
  },
});

export default new Entity();
