import { isObject, isEmpty, extend } from 'underscore';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'patient-fields';

const _Model = BaseModel.extend({
  type: TYPE,
  url() {
    return `/api/patients/${ this.get('_patient') }/fields/${ this.get('name') }`;
  },
  isNew() {
    // NOTE: This will treat the PATCH like a PUT
    // We won't always have an ID, but never need to POST
    return false;
  },
  getValue() {
    const value = this.get('value');
    return isObject(value) && isEmpty(value) ? null : value;
  },
  saveAll(attrs) {
    attrs = extend({}, this.attributes, attrs);

    const relationships = {
      'patient': this.toRelation(attrs._patient, 'patients'),
    };

    return this.save(attrs, { relationships }, { wait: true });
  },
});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  model: Model,
});

export {
  _Model,
  Model,
  Collection,
};
