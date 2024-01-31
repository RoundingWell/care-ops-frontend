import Radio from 'backbone.radio';
import Store from 'backbone.store';
import BaseModel from 'js/base/model';

const TYPE = 'workspace-patients';

const _Model = BaseModel.extend({
  type: TYPE,
  urlRoot: '/api/workspace-patients',
  saveAll(attrs) {
    const opts = { type: 'PUT' };

    const relationships = {
      'workspace': this.toRelation(this.get('_workspace'), 'workspaces'),
      'patient': this.toRelation(this.get('_patient'), 'patients'),
    };

    this.save(attrs, { relationships }, opts);
  },
  canEdit() {
    const currentUser = Radio.request('bootstrap', 'currentUser');

    return currentUser.can('patients:manage');
  },
});

const Model = Store(_Model, TYPE);

export {
  _Model,
  Model,
};
