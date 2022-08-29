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
    'fetch:forms:byAction': 'fetchByAction',
    'fetch:forms:definition:byAction': 'fetchDefinitionByAction',
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
  fetchByAction(actionId) {
    return this.fetchBy(`/api/actions/${ actionId }/form`);
  },
  fetchDefinitionByAction(actionId) {
    return $.ajax(`/api/actions/${ actionId }/form/definition`);
  },
});

export default new Entity();
