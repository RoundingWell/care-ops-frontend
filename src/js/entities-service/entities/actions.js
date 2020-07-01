import _ from 'underscore';
import moment from 'moment';
import Radio from 'backbone.radio';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';
import JsonApiMixin from 'js/base/jsonapi-mixin';

const TYPE = 'patient-actions';
const { parseRelationship } = JsonApiMixin;

const _parseRelationship = function(relationship, key) {
  if (!relationship || key === 'owner') return relationship;

  return parseRelationship(relationship, key);
};

const _Model = BaseModel.extend({
  urlRoot() {
    if (this.isNew()) return `/api/patients/${ this.get('_patient') }/relationships/actions`;

    return '/api/actions';
  },
  type: TYPE,
  validate({ name }) {
    if (!_.trim(name)) return 'Action name required';
  },
  getForm() {
    const formId = this.get('_form');
    if (!formId) return;
    return Radio.request('entities', 'forms:model', formId);
  },
  getRecentResponse() {
    const formResponses = Radio.request('entities', 'formResponses:collection', this.get('_form_responses'), {
      comparator(response) {
        return - moment(response.get('_created_at')).format('x');
      },
    });
    return formResponses.first();
  },
  getPatient() {
    return Radio.request('entities', 'patients:model', this.get('_patient'));
  },
  getOwner() {
    const owner = this.get('_owner');
    return Radio.request('entities', `${ owner.type }:model`, owner.id);
  },
  getFlow() {
    if (!this.get('_flow')) return;

    return Radio.request('entities', 'flows:model', this.get('_flow'));
  },
  getState() {
    return Radio.request('entities', 'states:model', this.get('_state'));
  },
  isDone() {
    const state = this.getState();
    return state.get('status') === 'done';
  },
  saveDueDate(date) {
    if (!date) {
      return this.save({ due_date: null, due_time: null });
    }
    return this.save({ due_date: date.format('YYYY-MM-DD') });
  },
  saveDueTime(time) {
    if (!time) {
      return this.save({ due_time: null });
    }
    return this.save({ due_time: time });
  },
  saveState(state) {
    return this.save({ _state: state.id }, {
      relationships: {
        state: this.toRelation(state),
      },
    });
  },
  saveOwner(owner) {
    return this.save({
      _owner: owner,
    },
    {
      relationships: {
        owner: this.toRelation(owner),
      },
    });
  },
  getSaveRelationships(attrs) {
    return {
      'form': this.toRelation(attrs._form, 'forms'),
      'owner': this.toRelation(attrs._owner),
      'state': this.toRelation(attrs._state, 'states'),
      'program-action': this.toRelation(attrs._program_action, 'program-actions'),
    };
  },
  saveAll(attrs) {
    attrs = _.extend({}, this.attributes, attrs);

    const relationships = this.getSaveRelationships(attrs);

    return this.save(attrs, { relationships }, { wait: true });
  },
  parseRelationship: _parseRelationship,
});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  url: '/api/actions',
  model: Model,
  parseRelationship: _parseRelationship,
  save(attrs = {}) {
    if (attrs.due_date === null) {
      attrs.due_time = null;
    }

    const data = this.map(action => {
      const actionData = action.toJSONApi(attrs);

      actionData.relationships = action.getSaveRelationships(attrs);

      return actionData;
    });

    return this.sync('patch', this, {
      url: _.result(this, 'url'),
      data: JSON.stringify({ data }),
    });
  },
});

export {
  _Model,
  Model,
  Collection,
};
