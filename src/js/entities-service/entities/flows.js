import _ from 'underscore';
import Radio from 'backbone.radio';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';
import JsonApiMixin from 'js/base/jsonapi-mixin';

const TYPE = 'flows';
const { parseRelationship } = JsonApiMixin;

const _parseRelationship = function(relationship, key) {
  if (!relationship || key === 'owner') return relationship;

  return parseRelationship(relationship, key);
};

const _Model = BaseModel.extend({
  urlRoot() {
    if (this.isNew()) return `/api/patients/${ this.get('_patient') }/relationships/flows`;

    return '/api/flows';
  },
  type: TYPE,
  getPatient() {
    return Radio.request('entities', 'patients:model', this.get('_patient'));
  },
  getOwner() {
    const owner = this.get('_owner');
    return Radio.request('entities', `${ owner.type }:model`, owner.id);
  },
  getState() {
    return Radio.request('entities', 'states:model', this.get('_state'));
  },
  isDone() {
    const state = this.getState();
    return state.get('status') === 'done';
  },
  isAllDone() {
    const { complete, total } = this.get('_progress');
    return complete === total;
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
      'state': this.toRelation(attrs._state, 'states'),
      'program-flow': this.toRelation(attrs._program_flow, 'program-flows'),
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
  url: '/api/flows',
  model: Model,
  parseRelationship: _parseRelationship,
  save(attrs = {}) {
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
