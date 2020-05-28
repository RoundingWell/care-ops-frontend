import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/reports';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'reports:model': 'getModel',
    'reports:collection': 'getCollection',
    'fetch:reports:model': 'fetchModel',
    'fetch:reports:collection': 'fetchCollection',
  },
});

export default new Entity();
