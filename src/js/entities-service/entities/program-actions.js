import { extend } from 'underscore';
import Radio from 'backbone.radio';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';
import JsonApiMixin from 'js/base/jsonapi-mixin';

import trim from 'js/utils/formatting/trim';

import { ACTION_OUTREACH } from 'js/static';

const TYPE = 'program-actions';
const { parseRelationship } = JsonApiMixin;

const _parseRelationship = function(relationship, key) {
  if (!relationship || key === 'owner') return relationship;

  return parseRelationship(relationship, key);
};

const _Model = BaseModel.extend({
  urlRoot: '/api/program-actions',
  type: TYPE,
  validate({ name }) {
    if (!trim(name)) return 'Action name required';
  },
  getAction({ patientId, flowId }) {
    const currentUser = Radio.request('bootstrap', 'currentUser');
    const currentOrg = Radio.request('bootstrap', 'currentOrg');
    const states = currentOrg.getStates();

    return Radio.request('entities', 'actions:model', {
      name: this.get('name'),
      _flow: flowId,
      _patient: patientId,
      _state: states.at(0).id,
      _owner: this.get('_owner') || {
        id: currentUser.id,
        type: 'clinicians',
      },
      _program_action: this.id,
    });
  },
  getOwner() {
    const owner = this.get('_owner');
    if (!owner) return;
    return Radio.request('entities', 'roles:model', owner.id);
  },
  saveOwner(owner) {
    owner = this.toRelation(owner);
    return this.save({ _owner: owner.data }, {
      relationships: { owner },
    });
  },
  getForm() {
    const formId = this.get('_form');
    if (!formId) return;
    return Radio.request('entities', 'forms:model', formId);
  },
  hasOutreach() {
    return this.get('outreach') !== ACTION_OUTREACH.DISABLED;
  },
  saveForm(form) {
    form = this.toRelation(form);
    const saveData = { _form: form.data };
    if (!form.data) saveData.outreach = ACTION_OUTREACH.DISABLED;

    return this.save(saveData, {
      relationships: { form },
    });
  },
  saveAll(attrs) {
    attrs = extend({}, this.attributes, attrs);

    const relationships = {
      'owner': this.toRelation(attrs._owner, 'roles'),
      'form': this.toRelation(attrs._form, 'forms'),
      'program-flow': this.toRelation(attrs._program_flow, 'program-flows'),
      'program': this.toRelation(attrs._program, 'programs'),
    };

    return this.save(attrs, { relationships }, { wait: true });
  },
  parseRelationship: _parseRelationship,
});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  initialize(models, options = {}) {
    this.flowId = options.flowId;
    if (this.flowId) this.comparator = 'sequence';
  },
  url() {
    if (this.flowId) return `/api/program-flows/${ this.flowId }/actions`;
    return '/api/program-actions';
  },
  model: Model,
  parseRelationship: _parseRelationship,
  updateSequences() {
    const data = this.map((flowAction, sequence) => {
      flowAction.set({ sequence });
      return flowAction.toJSONApi({ sequence });
    });

    return this.sync('patch', this, {
      url: this.url(),
      data: JSON.stringify({ data }),
    });
  },
});

export {
  _Model,
  Model,
  Collection,
};
