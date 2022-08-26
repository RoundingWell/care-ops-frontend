import { get } from 'underscore';
import Radio from 'backbone.radio';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';
import collectionOf from 'js/utils/formatting/collection-of';

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
  getContext() {
    return {
      contextScripts: this.getContextScripts(),
      reducers: this.getReducers(),
      changeReducers: this.getChangeReducers(),
      beforeSubmit: this.getBeforeSubmit(),
    };
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
    const formWidgets = get(this.get('options'), 'widgets');

    return Radio.request('entities', 'widgets:collection', collectionOf(get(formWidgets, 'widgets'), 'id'));
  },
  getWidgetFields() {
    const formWidgets = get(this.get('options'), 'widgets');

    return get(formWidgets, 'fields');
  },
  getPrefillFormId() {
    const prefillFormId = get(this.get('options'), 'prefill_form_id');

    if (!prefillFormId) return this.id;

    return prefillFormId;
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
