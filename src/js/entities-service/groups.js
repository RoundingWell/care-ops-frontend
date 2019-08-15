import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/groups';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'groups:model': 'getModel',
    'groups:collection': 'getCollection',
    'fetch:groups:collection': 'fetchGroups',
  },
  fetchGroups() {
    const data = { include: 'clinicians' };

    return this.fetchCollection({ data });
  },
});

export default new Entity();
