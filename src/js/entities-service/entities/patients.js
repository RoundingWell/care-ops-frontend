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
  validate({ first_name, last_name, birth_date, sex, _groups }) {
    const errors = {};

    if (!first_name || !last_name) errors.name = 'required';
    if (!sex) errors.sex = 'required';
    if (!_groups || !_groups.length) errors.groups = 'required';

    if (!birth_date) errors.birth_date = 'required';
    else if (dayjs(birth_date).isAfter()) errors.birth_date = 'invalidDate';

    if (!isEmpty(errors)) return errors;
  },
  getGroups() {
    return Radio.request('entities', 'groups:collection', this.get('_groups'));
  },
  getFields() {
    return Radio.request('entities', 'patientFields:collection', this.get('_patient_fields'));
  },
  addGroup(group) {
    const groups = this.getGroups();
    groups.add(group);
    this.set('_groups', groups.map(model => model.pick('id')));
  },
  removeGroup(group) {
    const groups = this.getGroups();
    groups.remove(group);
    this.set('_groups', groups.map(model => model.pick('id')));
  },
  saveAll(attrs) {
    attrs = extend({}, this.attributes, attrs);

    const relationships = {
      'groups': this.toRelation(attrs._groups, 'groups'),
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
  getSharedGroups() {
    const allGroupModels = pluck(this.invoke('getGroups'), 'models');
    return Radio.request('entities', 'groups:collection', intersection(...allGroupModels));
  },
});

export {
  Model,
  _Model,
  Collection,
};
