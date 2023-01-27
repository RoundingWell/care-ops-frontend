import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/workspaces';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'workspaces:model': 'getModel',
    'workspaces:collection': 'getCollection',
    'fetch:workspaces:collection': 'fetchCollection',
  },
});

export default new Entity();
