import { extend } from 'underscore';
import { v5 as uuid } from 'uuid';
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
  saveAll(attrs) {
    attrs = extend({}, this.attributes, attrs);

    // NOTE: sets the id instead of attrs.id due to how backbone's save works
    /* istanbul ignore next: Currently not saving new fields, but would be important if we do */
    if (!attrs.id) {
      this.set({ id: uuid(`resource:field:${ attrs.name.toLowerCase() }`, attrs._patient) });
    }

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
