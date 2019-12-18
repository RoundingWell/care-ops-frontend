import _ from 'underscore';
import moment from 'moment';
import Radio from 'backbone.radio';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'program-actions';

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

    const action = this.pick('name', 'details', '_role', '_program', '_forms');
    const dueDay = this.get('days_until_due');
    const dueDate = (dueDay === null) ? null : moment().add(dueDay, 'days').format('YYYY-MM-DD');

    _.extend(action, {
      _patient: patientId,
      _state: states.at(0).id,
      _clinician: action._role ? null : currentUser.id,
      duration: 0,
      due_date: dueDate,
    });

    return Radio.request('entities', 'actions:model', action);
  },
  getRole() {
    const roleId = this.get('_role');
    if (!roleId) return;
    return Radio.request('entities', 'roles:model', roleId);
  },
  saveRole(role) {
    return this.save({ _role: role.id }, {
      relationships: {
        role: this.toRelation(role.id, role.type),
      },
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
      role: this.toRelation(attrs._role, 'roles'),
    };

    return this.save(attrs, { relationships }, { wait: true });
  },
});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  url: '/api/program-actions',
  model: Model,
});

export {
  _Model,
  Model,
  Collection,
};
