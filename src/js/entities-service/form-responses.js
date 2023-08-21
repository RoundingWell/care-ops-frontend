import { reduce } from 'underscore';
import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/form-responses';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'formResponses:model': 'getModel',
    'formResponses:collection': 'getCollection',
    'fetch:formResponses:model': 'fetchFormResponse',
    'fetch:formResponses:latestSubmission': 'fetchLatestSubmission',
  },
  fetchFormResponse(id, options) {
    if (!id) return new Model();

    return this.fetchModel(id, options);
  },
  fetchLatestSubmission(filter) {
    const data = reduce(filter, (filters, value, key) => {
      if (!value) return filters;
      filters.filter[key] = value;
      return filters;
    }, { filter: {} });
    const model = new Model();
    return model.fetch({ url: '/api/form-responses/latest', data });
  },
});

export default new Entity();
