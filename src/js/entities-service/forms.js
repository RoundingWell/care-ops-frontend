import $ from 'jquery';

import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/forms';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'forms:model': 'getModel',
    'forms:collection': 'getCollection',
    'fetch:forms:model': 'fetchModel',
    'fetch:forms:collection': 'fetchCollection',
    'fetch:forms:definition': 'fetchDefinition',
    'fetch:forms:fields': 'fetchFields',
  },
  fetchDefinition(formId) {
    return $.ajax(`/api/forms/${ formId }/definition`);
  },
  fetchFields(actionId, patientId, formId) {
    if (actionId) {
      return $.ajax(`/api/actions/${ actionId }/form/fields`);
    }
    return $.ajax(`/api/forms/${ formId }/fields?filter[patient]=${ patientId }`);
  },
});

export default new Entity();
