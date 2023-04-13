import Backbone from 'backbone';
import Radio from 'backbone.radio';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

import trim from 'js/utils/formatting/trim';

import { PROGRAM_BEHAVIORS } from 'js/static';

const TYPE = 'programs';

function filterAddableProgramItems(entities) {
  return entities.filter(entity => {
    return entity.get('published') && entity.get('behavior') !== PROGRAM_BEHAVIORS.AUTOMATED;
  });
}

const _Model = BaseModel.extend({
  type: TYPE,
  validate({ name }) {
    if (!trim(name)) return 'Program name required';
  },
  urlRoot: '/api/programs',

  getPublished() {
    const programActions = Radio.request('entities', 'programActions:collection', this.get('_program_actions'));
    const programFlows = Radio.request('entities', 'programFlows:collection', this.get('_program_flows'));

    const actions = Radio.request('entities', 'programActions:collection', filterAddableProgramItems(programActions));
    const flows = Radio.request('entities', 'programFlows:collection', filterAddableProgramItems(programFlows));

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
