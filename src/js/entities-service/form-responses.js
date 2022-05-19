import $ from 'jquery';

import BaseEntity from 'js/base/entity-service';
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
    return $.ajax(`/api/form-responses/${ responseId }/response`);
  },
  fetchLatestSubmission(patientId, formId) {
    return $.ajax(`/api/patients/${ patientId }/form-responses/latest?filter[form]=${ formId }`);
  },
});

export default new Entity();
