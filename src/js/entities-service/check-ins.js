import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/check-ins';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'checkIns:model': 'getModel',
    'fetch:checkIn': 'fetchModel',
  },
});

export default new Entity();
