import _ from 'underscore';
import Radio from 'backbone.radio';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'programs';

const _Model = BaseModel.extend({
  type: TYPE,
  validate({ name }) {
    if (!_.trim(name)) return 'Program name required';
  },
  urlRoot: '/api/programs',

  getPublishedActions() {
    const programActions = Radio.request('entities', 'programActions:collection', this.get('_program_actions'));
    return Radio.request('entities', 'programActions:collection', programActions.filter({ status: 'published' }));
  },
});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  url: '/api/programs',
  model: Model,
});

export {
  Model,
  _Model,
  Collection,
};
