import _ from 'underscore';
import Radio from 'backbone.radio';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';
import JsonApiMixin from 'js/base/jsonapi-mixin';

const TYPE = 'program-flows';
const { parseRelationship } = JsonApiMixin;

const _parseRelationship = function(relationship, key) {
  if (!relationship || key === 'owner') return relationship;

  return parseRelationship(relationship, key);
};

const _Model = BaseModel.extend({
  urlRoot() {
    if (this.isNew()) return `/api/programs/${ this.get('_program') }/relationships/flows`;

    return '/api/program-flows';
  },
  type: TYPE,
  validate({ name }) {
    if (!_.trim(name)) return 'Flow name required';
  },
  getOwner() {
    const owner = this.get('_owner');
    if (!owner) return;
    return Radio.request('entities', 'roles:model', owner.id);
  },
  getFlow(patientId) {
    const currentOrg = Radio.request('bootstrap', 'currentOrg');
    const states = currentOrg.getStates();

    const flow = Radio.request('entities', 'flows:model', {
      _patient: patientId,
      _program_flow: this.get('id'),
      _state: states.at(0).id,
    });

    return flow;
  },
  saveOwner(owner) {
    owner = this.toRelation(owner);
    return this.save({ _owner: owner.data }, {
      relationships: { owner },
    });
  },
  saveAll(attrs) {
    attrs = _.extend({}, this.attributes, attrs);

    const relationships = {
      owner: this.toRelation(attrs._owner, 'roles'),
    };

    return this.save(attrs, { relationships }, { wait: true });
  },
  getActions() {
    const flowActions = Radio.request('entities', 'programFlowActions:collection', this.get('_program_flow_actions'), { flowId: this.id });
    return Radio.request('entities', 'programActions:collection', flowActions.invoke('getAction'));
  },
  parseRelationship: _parseRelationship,
});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  url: '/api/program-flows',
  model: Model,
  parseRelationship: _parseRelationship,
});

export {
  _Model,
  Model,
  Collection,
};
