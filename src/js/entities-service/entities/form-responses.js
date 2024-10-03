import { get, omit } from 'underscore';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

import { alphaSort } from 'js/utils/sorting';
import JsonApiMixin from 'js/base/jsonapi-mixin';

import { FORM_RESPONSE_STATUS } from 'js/static';

const TYPE = 'form-responses';
const { parseRelationship } = JsonApiMixin;

const _parseRelationship = function(relationship, key) {
  if (key === 'editor') return relationship;

  return parseRelationship(relationship, key);
};

const _Model = BaseModel.extend({
  type: TYPE,
  urlRoot: '/api/form-responses',
  saveAll() {
    const attrs = this.attributes;

    const relationships = {
      'form': this.toRelation(attrs._form, 'forms'),
      'patient': this.toRelation(attrs._patient, 'patients'),
      'action': this.toRelation(attrs._action, 'patient-actions'),
    };

    return this.save(attrs, { relationships }, { wait: true });
  },
  getDraft() {
    if (this.get('status') !== FORM_RESPONSE_STATUS.DRAFT) return;

    return {
      updated: this.get('updated_at'),
      submission: this.getResponse(),
    };
  },
  getResponse() {
    return get(this.get('response'), 'data', {});
  },
  getFormData() {
    return omit(this.get('response'), 'data');
  },
  getEditor() {
    // editor can be a clinician or patient
    const editor = this.get('_editor');
    const Editor = Store.get(editor.type);

    return new Editor({ id: editor.id });
  },
  getEditorName() {
    const editor = this.getEditor();

    return editor.get('name') || `${ editor.get('first_name') } ${ editor.get('last_name') }`;
  },
  parseRelationship: _parseRelationship,
});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  url: '/api/form-responses',
  model: Model,
  parseRelationship: _parseRelationship,
  comparator(responseA, responseB) {
    return alphaSort('desc', responseA.get('updated_at'), responseB.get('updated_at'));
  },
  getFirstSubmission() {
    return this.find({ status: FORM_RESPONSE_STATUS.SUBMITTED });
  },
  filterSubmissions() {
    const clone = this.clone();
    const submissions = this.filter({ status: FORM_RESPONSE_STATUS.SUBMITTED });

    clone.reset(submissions);

    return clone;
  },
});

export {
  _Model,
  Model,
  Collection,
};
