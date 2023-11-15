import { get, size } from 'underscore';
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

const defaultSubmitReducer = `
  formData.fields = formSubmission.fields || _.get(formSubmission, 'patient.fields');

  return formData;
`;

const defaultBeforeSubmit = 'return formSubmission;';

const _Model = BaseModel.extend({
  type: TYPE,
  urlRoot: '/api/forms',
  isReadOnly() {
    return get(this.get('options'), 'read_only');
  },
  isSubmitHidden() {
    return get(this.get('options'), 'submit_hidden');
  },
  getContext() {
    return {
      contextScripts: this.getContextScripts(),
      loaderReducers: this.getLoaderReducers(),
      changeReducers: this.getChangeReducers(),
      beforeSubmit: this.getBeforeSubmit(),
      submitReducers: this.getSubmitReducers(),
    };
  },
  getContextScripts() {
    return get(this.get('options'), 'context', []);
  },
  getLoaderReducers() {
    return get(this.get('options'), 'reducers', [defaultReducer]);
  },
  getChangeReducers() {
    return get(this.get('options'), 'changeReducers', []);
  },
  getBeforeSubmit() {
    return get(this.get('options'), 'beforeSubmit', defaultBeforeSubmit);
  },
  getSubmitReducers() {
    const submitReducers = get(this.get('options'), 'submitReducers');

    return size(submitReducers) ? submitReducers : [defaultSubmitReducer];
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
  getPrefillActionTag() {
    return get(this.get('options'), 'prefill_action_tag');
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
