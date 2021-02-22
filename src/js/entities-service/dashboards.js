import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/dashboards';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'dashboards:model': 'getModel',
    'dashboards:collection': 'getCollection',
    'fetch:dashboards:model': 'fetchModel',
    'fetch:dashboards:collection': 'fetchCollection',
  },
});

export default new Entity();
