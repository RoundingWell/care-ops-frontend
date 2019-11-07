import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/groups';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'groups:model': 'getModel',
    'groups:collection': 'getCollection',
    'fetch:groups:collection': 'fetchCollection',
  },
});

export default new Entity();
