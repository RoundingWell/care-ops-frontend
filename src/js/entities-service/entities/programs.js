import Backbone from 'backbone';
import Radio from 'backbone.radio';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

import trim from 'js/utils/formatting/trim';

import { PUBLISH_STATE_STATUS } from 'js/static';

const TYPE = 'programs';

const _Model = BaseModel.extend({
  type: TYPE,
  validate({ name }) {
    if (!trim(name)) return 'Program name required';
  },
  urlRoot: '/api/programs',

  getPublished() {
    const programActions = Radio.request('entities', 'programActions:collection', this.get('_program_actions'));
    const programFlows = Radio.request('entities', 'programFlows:collection', this.get('_program_flows'));
    const status = PUBLISH_STATE_STATUS.PUBLISHED;
    const actions = Radio.request('entities', 'programActions:collection', programActions.filter({ status }));
    const flows = Radio.request('entities', 'programFlows:collection', programFlows.filter({ status }));

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
