import { extend } from 'underscore';
import Radio from 'backbone.radio';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';
import JsonApiMixin from 'js/base/jsonapi-mixin';
import fetcher from 'js/base/fetch';

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
  getProgramFlow() {
    return Radio.request('entities', 'programFlows:model', this.get('_program_flow'));
  },
  isDone() {
    const state = this.getState();
    return state.isDone();
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
    return this.save({ _owner: owner }, {
      relationships: {
        owner: this.toRelation(owner),
      },
    });
  },
  applyOwner(owner) {
    const url = `${ this.url() }/relationships/actions`;
    const relationships = { 'owner': this.toRelation(owner) };

    return fetcher(url, { method: 'PATCH', body: JSON.stringify({ data: { relationships } }) });
  },
  saveAll(attrs) {
    if (this.isNew()) attrs = extend({}, this.attributes, attrs);

    const relationships = {
      'state': this.toRelation(attrs._state, 'states'),
      'owner': this.toRelation(attrs._owner),
      'program-flow': this.toRelation(attrs._program_flow, 'program-flows'),
    };

    return this.save(attrs, { relationships }, { wait: true });
  },
  parseRelationship: _parseRelationship,
});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  url: '/api/flows',
  model: Model,
  parseRelationship: _parseRelationship,
  save(attrs) {
    const saves = this.invoke('saveAll', attrs);

    return Promise.all(saves);
  },
  applyOwner(owner) {
    const saves = this.invoke('applyOwner', owner);

    return Promise.all(saves);
  },
  getPatients() {
    return Radio.request('entities', 'patients:collection', this.invoke('getPatient'));
  },
});

export {
  _Model,
  Model,
  Collection,
};
