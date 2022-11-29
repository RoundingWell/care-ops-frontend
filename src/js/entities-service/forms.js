import BaseEntity from 'js/base/entity-service';
import fetcher, { handleJSON } from 'js/base/fetch';
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
    return fetcher(`/api/forms/${ formId }/definition`).then(handleJSON);
  },
  fetchFields(actionId, patientId, formId) {
    if (actionId) {
      return fetcher(`/api/actions/${ actionId }/form/fields`).then(handleJSON);
    }
    return fetcher(`/api/forms/${ formId }/fields?filter[patient]=${ patientId }`).then(handleJSON);
  },
  fetchByAction(actionId) {
    return this.fetchBy(`/api/actions/${ actionId }/form`);
  },
  fetchDefinitionByAction(actionId) {
    return fetcher(`/api/actions/${ actionId }/form/definition`).then(handleJSON);
  },
});

export default new Entity();
