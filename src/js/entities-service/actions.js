import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/actions';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'actions:model': 'getModel',
    'actions:collection': 'getCollection',
    'fetch:actions:collection': 'fetchActions',
  },
  fetchActions() {
    const include = [
      'clinician',
      'patient',
      'events',
      'role',
      'state',
    ].join(',');

    const data = { include };

    return this.fetchCollection({ data });
  },
});

export default new Entity();
