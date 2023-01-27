import { extend, intersection, pluck, isEmpty } from 'underscore';
import Radio from 'backbone.radio';
import Store from 'backbone.store';
import dayjs from 'dayjs';

import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'patients';

const _Model = BaseModel.extend({
  type: TYPE,
  urlRoot: '/api/patients',
  /* eslint-disable complexity */
  validate({ first_name, last_name, birth_date, sex, _workspaces }) {
    const errors = {};

    if (!first_name || !last_name) errors.name = 'required';
    if (!sex) errors.sex = 'required';
    if (!_workspaces || !_workspaces.length) errors.workspaces = 'required';

    if (!birth_date) errors.birth_date = 'required';
    else if (dayjs(birth_date).isAfter()) errors.birth_date = 'invalidDate';

    if (!isEmpty(errors)) return errors;
  },
  getWorkspaces() {
    return Radio.request('entities', 'workspaces:collection', this.get('_workspaces'));
  },
  getFields() {
    return Radio.request('entities', 'patientFields:collection', this.get('_patient_fields'));
  },
  getField(name) {
    const fields = this.getFields();
    return fields.find({ name });
  },
  addWorkspace(workspace) {
    const workspaces = this.getWorkspaces();
    workspaces.add(workspace);
    this.set('_workspaces', workspaces.map(model => model.pick('id')));
  },
  removeWorkspace(workspace) {
    const workspaces = this.getWorkspaces();
    workspaces.remove(workspace);
    this.set('_workspaces', workspaces.map(model => model.pick('id')));
  },
  saveAll(attrs) {
    attrs = extend({}, this.attributes, attrs);

    const relationships = {
      'workspaces': this.toRelation(attrs._workspaces, 'workspaces'),
    };

    return this.save(attrs, { relationships }, { wait: true });
  },
  canEdit() {
    return this.isNew() || this.get('source') === 'manual';
  },
  getSortName() {
    return (this.get('last_name') + this.get('first_name')).toLowerCase();
  },
});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  url: '/api/patients',
  model: Model,
  getSharedWorkspaces() {
    const allWorkspaceModels = pluck(this.invoke('getWorkspaces'), 'models');
    return Radio.request('entities', 'workspaces:collection', intersection(...allWorkspaceModels));
  },
});

export {
  Model,
  _Model,
  Collection,
};
