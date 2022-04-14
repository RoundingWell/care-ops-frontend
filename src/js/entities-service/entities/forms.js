import { get } from 'underscore';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'forms';

const defaultReducer = `
  const subm = _.extend({ patient: {} }, formSubmission,  formData);

  subm.patient.fields = _.extend({}, _.get(formSubmission, 'patient.fields'), _.get(formData, 'patient.fields'));

  return subm;
`;

const defaultBeforeSubmit = 'return formSubmission;';

const _Model = BaseModel.extend({
  type: TYPE,
  urlRoot: '/api/forms',
  isReadOnly() {
    return get(this.get('options'), 'read_only');
  },
  getReducers() {
    return get(this.get('options'), 'reducers', [defaultReducer]);
  },
  getChangeReducers() {
    return get(this.get('options'), 'changeReducers', []);
  },
  getContextScripts() {
    return get(this.get('options'), 'context', []);
  },
  getBeforeSubmit() {
    return get(this.get('options'), 'beforeSubmit', defaultBeforeSubmit);
  },
  getWidgets() {
    return get(this.get('options'), 'widgets', { fields: [], widgets: [] });
  },
});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  url: '/api/forms',
  model: Model,
  comparator: 'name',
});

export {
  _Model,
  Model,
  Collection,
};
