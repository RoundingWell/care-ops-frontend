import { reduce } from 'underscore';
import BaseEntity from 'js/base/entity-service';
import fetcher, { handleJSON } from 'js/base/fetch';
import { _Model, Model, Collection } from './entities/form-responses';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'formResponses:model': 'getModel',
    'formResponses:collection': 'getCollection',
    'fetch:formResponses:submission': 'fetchSubmission',
    'fetch:formResponses:latestSubmission': 'fetchLatestSubmission',
  },
  fetchSubmission(responseId) {
    if (!responseId) return [{}];
    return fetcher(`/api/form-responses/${ responseId }/response`).then(handleJSON);
  },
  fetchLatestSubmission(patientId, filter) {
    const searchParams = reduce(filter, (filters, value, key) => {
      if (!value) return filters;
      const param = `filter[${ key }]=${ encodeURIComponent(value) }`;
      return filters + (filters ? '&' : '?') + param;
    }, '');

    return fetcher(`/api/patients/${ patientId }/form-responses/latest${ searchParams }`).then(handleJSON);
  },
});

export default new Entity();
