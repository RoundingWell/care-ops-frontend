import { get } from 'underscore';
import Radio from 'backbone.radio';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

import { alphaSort } from 'js/utils/sorting';
import JsonApiMixin from 'js/base/jsonapi-mixin';

import { FORM_RESPONSE_STATUS } from 'js/static';

const TYPE = 'form-responses';
const { parseRelationship } = JsonApiMixin;

const _parseRelationship = function(relationship, key) {
  if (!relationship || key === 'editor') return relationship;

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
  getEditor() {
    const { id, type } = this.get('_editor');
    return Radio.request('entities', `${ type }:model`, id);
  },
  getDraft() {
    if (this.get('status') !== FORM_RESPONSE_STATUS.DRAFT) return;

    return {
      updated: this.get('created_at'),
      submission: this.getResponse(),
    };
  },
  getResponse() {
    return get(this.get('response'), 'data', {});
  },
  parseRelationship: _parseRelationship,
});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  url: '/api/form-responses',
  model: Model,
  parseRelationship: _parseRelationship,
  comparator(responseA, responseB) {
    return alphaSort('desc', responseA.get('created_at'), responseB.get('created_at'));
  },
  getDraft() {
    const currentUser = Radio.request('bootstrap', 'currentUser');
    return this.find(function(response) {
      return response.get('status') === FORM_RESPONSE_STATUS.DRAFT && response.getEditor() === currentUser;
    });
  },
  getFirstSubmission() {
    return this.find({ status: FORM_RESPONSE_STATUS.SUBMITTED });
  },
});

export {
  _Model,
  Model,
  Collection,
};
