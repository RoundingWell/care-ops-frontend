import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/teams';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'teams:model': 'getModel',
    'teams:collection': 'getCollection',
    'fetch:teams:collection': 'fetchCollection',
  },
});

export default new Entity();
