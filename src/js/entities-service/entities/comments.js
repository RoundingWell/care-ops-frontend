import _ from 'underscore';
import Radio from 'backbone.radio';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'comments';

const _Model = BaseModel.extend({
  type: TYPE,
  urlRoot() {
    if (this.isNew()) return `/api/actions/${ this.get('_action') }/relationships/comments`;

    return '/api/comments';
  },
  validate({ message }) {
    if (!_.trim(message)) return 'Comment message required.';
  },
  getClinician() {
    return Radio.request('entities', 'clinicians:model', this.get('_clinician'));
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
