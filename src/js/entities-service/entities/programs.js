import _ from 'underscore';
import Backbone from 'backbone';
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

  getPublished() {
    const programActions = Radio.request('entities', 'programActions:collection', this.get('_program_actions'));
    const programFlows = Radio.request('entities', 'programFlows:collection', this.get('_program_flows'));

    const actions = Radio.request('entities', 'programActions:collection', programActions.filter({ status: 'published' }));
    const flows = Radio.request('entities', 'programFlows:collection', programFlows.filter({ status: 'published' }));

    return new Backbone.Collection([...flows.models, ...actions.models], { comparator: 'name' });
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
