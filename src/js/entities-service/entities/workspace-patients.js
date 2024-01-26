import Radio from 'backbone.radio';
import Store from 'backbone.store';
import BaseModel from 'js/base/model';

const TYPE = 'workspace-patients';

const _Model = BaseModel.extend({
  type: TYPE,
  urlRoot: '/api/workspace-patients',
  setNewStatus(newStatus, patient) {
    const currentWorkspace = Radio.request('bootstrap', 'currentWorkspace');

    const attrs = { status: newStatus };
    const opts = { type: 'PUT' };

    const relationships = {
      'workspace': this.toRelation(currentWorkspace, 'workspaces'),
      'patient': this.toRelation(patient, 'patients'),
    };

    this.save(attrs, { relationships }, opts);
  },
});

const Model = Store(_Model, TYPE);

export {
  _Model,
  Model,
};
