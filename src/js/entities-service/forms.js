import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/forms';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'forms:model': 'getModel',
    'forms:collection': 'getCollection',
    'fetch:forms:collection': 'fetchCollection',
  },
});

export default new Entity();
