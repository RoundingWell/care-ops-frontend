import { reduce } from 'underscore';
import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/form-responses';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'formResponses:model': 'getModel',
    'formResponses:collection': 'getCollection',
    'fetch:formResponses:model': 'fetchFormResponse',
    'fetch:formResponses:latest': 'fetchLatestResponse',
  },
  fetchFormResponse(id, options) {
    if (!id) return new Model();

    return this.fetchModel(id, options);
  },
  fetchLatestResponse(filter) {
    const data = reduce(filter, (filters, value, key) => {
      if (!value) return filters;
      filters.filter[key] = value;
      return filters;
    }, { filter: {} });

    return this.fetchBy('/api/form-responses/latest', { data })
      .then(response => {
        if (!response) return new Model();
        return response;
      });
  },
});

export default new Entity();
