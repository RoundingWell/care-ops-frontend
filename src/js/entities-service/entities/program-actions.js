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
  urlRoot() {
    if (this.isNew() && this.get('_program')) return `/api/programs/${ this.get('_program') }/relationships/actions`;

    return '/api/program-actions';
  },
  type: TYPE,
  validate({ name }) {
    if (!_.trim(name)) return 'Action name required';
  },
  getAction(patientId) {
    const currentUser = Radio.request('bootstrap', 'currentUser');
    const currentOrg = Radio.request('bootstrap', 'currentOrg');
    const states = currentOrg.getStates();

    const action = this.pick('name', 'details', '_owner', '_program', '_forms');
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
    // NOTE: This entity assumes one form per program-action
    const forms = Radio.request('entities', 'forms:collection', this.get('_forms'));

    return forms.at(0);
  },
  saveForm(form) {
    // NOTE: This entity assumes one form per program-action
    // But the API supports multiple form relationships
    const url = `${ this.url() }/relationships/forms`;

    if (!form) {
      const currentForms = this.get('_forms');
      return this.save({ _forms: [] }, {}, {
        url,
        method: 'DELETE',
        data: JSON.stringify({ data: [{ id: currentForms[0].id, type: 'forms' }] }),
      });
    }

    return this.save({ _forms: [{ id: form.id }] }, {}, {
      url,
      method: 'POST',
      data: JSON.stringify({ data: [{ id: form.id, type: 'forms' }] }),
    });
  },
  saveAll(attrs) {
    attrs = _.extend({}, this.attributes, attrs);

    const relationships = {
      owner: this.toRelation(attrs._owner, 'roles'),
    };

    return this.save(attrs, { relationships }, { wait: true });
  },
  parseRelationship: _parseRelationship,
});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  url: '/api/program-actions',
  model: Model,
  parseRelationship: _parseRelationship,
});

export {
  _Model,
  Model,
  Collection,
};
