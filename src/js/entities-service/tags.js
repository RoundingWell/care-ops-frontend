import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/tags';

let tagsCache;

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'fetch:tags:collection': 'fetchTags',
  },
  fetchTags() {
    if (tagsCache) return tagsCache;

    return this.fetchCollection().then(tags => {
      tagsCache = tags;
      return tags;
    });
  },
});

export default new Entity();
