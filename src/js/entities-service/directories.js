import BaseEntity from 'js/base/entity-service';
import { Model, Collection } from './entities/directories';

const Entity = BaseEntity.extend({
  Entity: { Model, Collection },
  radioRequests: {
    'directories:collection': 'getCollection',
    'fetch:directories:model': 'fetchDirectory',
    'fetch:directories:filterable': 'fetchFilterable',
  },
  fetchDirectory(slug, query) {
    const model = new Model({ slug });

    return model.fetch({ data: query });
  },
  fetchFilterable() {
    const data = { filter: { filterable: true } };

    return this.fetchCollection({ data });
  },
});

export default new Entity();
