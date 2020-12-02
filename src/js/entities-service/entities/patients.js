import { extend, intersection, pluck } from 'underscore';
import Radio from 'backbone.radio';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

import trim from 'js/utils/formatting/trim';

const TYPE = 'patients';

const _Model = BaseModel.extend({
  type: TYPE,
  urlRoot: '/api/patients',
  defaults: {
    _groups: [],
  },
  validate(attrs) {
    if (!trim(attrs.first_name)) {
      return 'A patient first name is required';
    }

    if (!trim(attrs.last_name)) {
      return 'A patient last name is required';
    }

    if (!trim(attrs.birth_date)) {
      return 'A patient date of birth is required';
    }

    if (!attrs.sex) {
      return 'A patient sex is required';
    }
  },
  getGroups() {
    return Radio.request('entities', 'groups:collection', this.get('_groups'));
  },
  getFields() {
    return Radio.request('entities', 'patientFields:collection', this.get('_patient_fields'));
  },
  saveAll(attrs) {
    if (this.isNew()) attrs = extend({}, this.attributes, attrs);

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
