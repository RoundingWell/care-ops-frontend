import BaseEntity from 'js/base/entity-service';
import { _Model, Model } from './entities/organizations';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model },
  radioRequests: {
    'organizations:model': 'getModel',
  },
});

export default new Entity();
