import { extend, intersection, pluck, reject } from 'underscore';
import Radio from 'backbone.radio';
import Store from 'backbone.store';
import dayjs from 'dayjs';

import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'patients';

const _Model = BaseModel.extend({
  type: TYPE,
  urlRoot: '/api/patients',
  validate(attrs, { preSave }) {
    if (preSave) {
      return this.preSaveValidate(attrs);
    }

    if (!attrs.first_name || !attrs.last_name) return { name: 'required' };
    if (!attrs.birth_date) return { birth_date: 'required' };
    if (!attrs.sex) return { sex: 'required' };
    if (!attrs._groups || !attrs._groups.length) return { groups: 'required' };
  },
  preSaveValidate(attrs) {
    const birthDate = dayjs(attrs.birth_date);

    if (dayjs().isBefore(birthDate)) return { birth_date: 'invalidDate' };
  },
  getGroups() {
    return Radio.request('entities', 'groups:collection', this.get('_groups'));
  },
  getFields() {
    return Radio.request('entities', 'patientFields:collection', this.get('_patient_fields'));
  },
  addGroup(group) {
    const groups = this.get('_groups') || [];

    this.set('_groups', groups.concat(group.id));
  },
  removeGroup(group) {
    const groups = this.get('_groups');

    this.set('_groups', reject(groups, groupId => groupId === group.id));
  },
  saveAll() {
    const attrs = extend({}, this.attributes);

    const relationships = {
      'groups': this.toRelation(attrs._groups, 'groups'),
    };

    return this.save(attrs, { relationships }, { wait: true });
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
