import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/events';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'events:model': 'getModel',
    'events:collection': 'getCollection',
    'fetch:actionEvents:collection': 'fetchActionEvents',
  },
  fetchActionEvents(actionId) {
    return this.fetchCollection({ url: `/api/actions/${ actionId }/activity` });
  },
});

export default new Entity();
