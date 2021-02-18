import $ from 'jquery';

import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/forms';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'forms:model': 'getModel',
    'forms:collection': 'getCollection',
    'fetch:forms:collection': 'fetchCollection',
    'fetch:forms:definition': 'fetchDefinition',
    'fetch:forms:fields': 'fetchFields',
  },
  fetchDefinition(formId) {
    return $.ajax(`/api/forms/${ formId }/definition`);
  },
  fetchFields(patientId, formId, responseId) {
    return $.ajax(`/api/forms/${ formId }/fields?filter[patient]=${ patientId }&filter[cleared]=${ !!responseId }`);
  },
});

export default new Entity();
