import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/organizations';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'organizations:model': 'getModel',
    'organizations:collection': 'getCollection',
  },
});

export default new Entity();
