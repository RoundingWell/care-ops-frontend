import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/settings';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'settings:model': 'getModel',
    'fetch:settings:model': 'fetchModel',
  },
});

export default new Entity();
