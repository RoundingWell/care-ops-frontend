import { isObject, isEmpty } from 'underscore';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'patient-fields';

const _Model = BaseModel.extend({
  type: TYPE,
  getValue() {
    const value = this.get('value');
    return isObject(value) && isEmpty(value) ? null : value;
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
