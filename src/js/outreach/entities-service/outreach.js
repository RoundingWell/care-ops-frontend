import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/outreach';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'outreach:model': 'getModel',
    'fetch:outreach:byAction': 'fetchOutreachByAction',
  },
  fetchOutreachByAction(actionId) {
    return this.fetchBy(`/api/outreach?filter[action]=${ actionId }`);
  },
});

export default new Entity();
