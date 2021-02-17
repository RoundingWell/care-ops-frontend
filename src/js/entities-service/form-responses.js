import $ from 'jquery';

import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/form-responses';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'formResponses:model': 'getModel',
    'formResponses:collection': 'getCollection',
    'fetch:formResponses:submission': 'fetchSubmission',
  },
  fetchSubmission(responseId) {
    return $.ajax(`/api/form-responses/${ responseId }/response`);
  },
});

export default new Entity();
