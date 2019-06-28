import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/events';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'events:model': 'getModel',
    'events:collection': 'getCollection',
  },
});

export default new Entity();
