import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/files';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'files:model': 'getModel',
    'fetch:files:collection:byAction': 'fetchFilesByAction',
  },
  fetchFilesByAction(actionId) {
    const url = `/api/actions/${ actionId }/relationships/files`;

    return this.fetchCollection({ url });
  },
});

export default new Entity();
