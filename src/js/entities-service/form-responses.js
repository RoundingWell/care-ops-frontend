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
    'fetch:formResponses:submission:byAction': 'fetchLatestSubmissionByAction',
  },
  fetchSubmission(responseId) {
    if (!responseId) return [{}];
    return fetcher(`/api/form-responses/${ responseId }/response`).then(handleJSON);
  },
  fetchLatestSubmission(patientId, filter) {
    const data = reduce(filter, (filters, value, key) => {
      if (!value) return filters;
      filters.filter[key] = value;
      return filters;
    }, { filter: {} });
    return fetcher(`/api/patients/${ patientId }/form-responses/latest`, { data }).then(handleJSON);
  },
  fetchLatestSubmissionByAction(actionId, filter) {
    const data = reduce(filter, (filters, value, key) => {
      if (!value) return filters;
      filters.filter[key] = value;
      return filters;
    }, { filter: {} });
    return fetcher(`/api/actions/${ actionId }/form-responses/latest`, { data }).then(handleJSON);
  },
});

export default new Entity();
