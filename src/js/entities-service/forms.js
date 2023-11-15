import BaseEntity from 'js/base/entity-service';
import fetcher, { handleJSON } from 'js/base/fetch';
import { _Model, Model, Collection } from './entities/forms';

import BaseModel from 'js/base/model';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'forms:model': 'getModel',
    'forms:collection': 'getCollection',
    'fetch:forms:model': 'fetchModel',
    'fetch:forms:collection': 'fetchCollection',
    'fetch:forms:definition': 'fetchDefinition',
    'fetch:forms:data': 'fetchFormData',
    'fetch:forms:byAction': 'fetchByAction',
    'fetch:forms:definition:byAction': 'fetchDefinitionByAction',
  },
  fetchDefinition(formId) {
    return fetcher(`/api/forms/${ formId }/definition`).then(handleJSON);
  },
  fetchFormData(actionId, patientId, formId) {
    const model = new BaseModel();
    if (actionId) {
      return model.fetch({ url: `/api/actions/${ actionId }/form/fields` });
    }

    const data = { filter: { patient: patientId } };
    return model.fetch({ url: `/api/forms/${ formId }/fields`, data });
  },
  fetchByAction(actionId) {
    return this.fetchBy(`/api/actions/${ actionId }/form`);
  },
  fetchDefinitionByAction(actionId) {
    return fetcher(`/api/actions/${ actionId }/form/definition`).then(handleJSON);
  },
});

export default new Entity();
