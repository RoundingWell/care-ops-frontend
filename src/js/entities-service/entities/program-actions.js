import _ from 'underscore';
import moment from 'moment';
import Radio from 'backbone.radio';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';
import JsonApiMixin from 'js/base/jsonapi-mixin';

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
    if (!_.trim(name)) return 'Action name required';
  },
  getAction(patientId) {
    const currentUser = Radio.request('bootstrap', 'currentUser');
    const currentOrg = Radio.request('bootstrap', 'currentOrg');
    const states = currentOrg.getStates();
    const action = this.pick('name', 'details', '_owner', '_program', '_form');
    const dueDay = this.get('days_until_due');
    const dueDate = (dueDay === null) ? null : moment().add(dueDay, 'days').format('YYYY-MM-DD');

    _.extend(action, {
      _patient: patientId,
      _state: states.at(0).id,
      _owner: action._owner || {
        id: currentUser.id,
        type: 'clinicians',
      },
      duration: 0,
      due_date: dueDate,
    });

    return Radio.request('entities', 'actions:model', action);
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
  saveForm(form) {
    return this.save({ _form: form.id }, {
      relationships: {
        form: this.toRelation(form.id, form.type),
      },
    });
  },
  saveAll(attrs) {
    attrs = _.extend({}, this.attributes, attrs);

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
