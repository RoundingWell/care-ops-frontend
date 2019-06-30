import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/organizations';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'organizations:model': 'getModel',
    'organizations:collection': 'getCollection',
    'fetch:organizations:model': 'fetchOrganization',
  },
  fetchOrganization(id) {
    const include = [
      'groups',
      'roles',
      'states',
    ].join(',');

    const data = { include };

    return this.fetchModel(id, { data });
  },
});

export default new Entity();
