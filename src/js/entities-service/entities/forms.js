import { get } from 'underscore';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'forms';

const defaultReducer = `
  const formSubmission = _.extend({ patient: {} }, prefill,  formData);

  formSubmission.patient.fields = _.extend({}, _.get(prefill, 'patient.fields'), _.get(formData, 'patient.fields'));

  return formSubmission;
`;

const _Model = BaseModel.extend({
  type: TYPE,
  urlRoot: '/api/forms',
  isReadOnly() {
    return get(this.get('options'), 'read_only');
  },
  getReducers() {
    return get(this.get('options'), 'reducers', [defaultReducer]);
  },
  getContextScripts() {
    return get(this.get('options'), 'scripts', []);
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
