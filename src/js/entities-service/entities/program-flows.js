import _ from 'underscore';
import Radio from 'backbone.radio';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'program-flows';

const _Model = BaseModel.extend({
  urlRoot() {
    if (this.isNew()) return `/api/programs/${ this.get('_program') }/relationships/flows`;

    return '/api/program-flows';
  },
  type: TYPE,
  validate({ name }) {
    if (!_.trim(name)) return 'Flow name required';
  },
  getRole() {
    const roleId = this.get('_role');
    if (!roleId) return;
    return Radio.request('entities', 'roles:model', roleId);
  },
  getFlow(patientId) {
    const currentUser = Radio.request('bootstrap', 'currentUser');
    const currentOrg = Radio.request('bootstrap', 'currentOrg');
    const states = currentOrg.getStates();

    const flow = Radio.request('entities', 'flows:model', {
      name: this.get('name'),
      details: this.get('details'),
      _clinician: this.get('_role') ? null : currentUser.id,
      _patient: patientId,
      _program_flow: this.get('id'),
      _role: this.get('_role'),
      _state: states.at(0).id,
    });

    return flow;
  },
  saveRole(role) {
    return this.save({ _role: role.id }, {
      relationships: {
        role: this.toRelation(role.id, role.type),
      },
    });
  },
  saveAll(attrs) {
    attrs = _.extend({}, this.attributes, attrs);
    const relationships = {
      role: this.toRelation(attrs._role, 'roles'),
    };

    return this.save(attrs, { relationships }, { wait: true });
  },
  getActions() {
    const flowActions = Radio.request('entities', 'programFlowActions:collection', this.get('_program_flow_actions'));
    return Radio.request('entities', 'programActions:collection', flowActions.invoke('getAction'));
  },
});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  url: '/api/program-flows',
  model: Model,
});

export {
  _Model,
  Model,
  Collection,
};
