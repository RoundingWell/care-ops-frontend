import _ from 'underscore';
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
    // NOTE: This entity assumes one form per action
    const forms = Radio.request('entities', 'forms:collection', this.get('_forms'));

    return forms.at(0);
  },
  getPatient() {
    return Radio.request('entities', 'patients:model', this.get('_patient'));
  },
  getOwner() {
    const owner = this.get('_owner');
    if (!owner) return;
    return Radio.request('entities', `${ owner.type }:model`, owner.id);
  },
  getFlow() {
    if (!this.get('_flow')) return;

    return Radio.request('entities', 'flows:model', this.get('_flow'));
  },
  isDone() {
    const state = Radio.request('entities', 'states:model', this.get('_state'));
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
  saveAll(attrs) {
    attrs = _.extend({}, this.attributes, attrs);

    const relationships = {
      forms: this.toRelation(attrs._forms, 'forms'),
      owner: this.toRelation(attrs._owner),
      state: this.toRelation(attrs._state, 'states'),
      program: this.toRelation(attrs._program, 'programs'),
    };

    return this.save(attrs, { relationships }, { wait: true });
  },
  parseRelationship: _parseRelationship,
});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  url: '/api/actions',
  model: Model,
  parseRelationship: _parseRelationship,
});

export {
  _Model,
  Model,
  Collection,
};
