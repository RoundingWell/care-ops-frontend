import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/roles';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'roles:model': 'getModel',
    'roles:collection': 'getCollection',
  },
});

export default new Entity();
