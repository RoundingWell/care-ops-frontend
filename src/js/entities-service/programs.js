import Radio from 'backbone.radio';

import BaseEntity from 'js/base/entity-service';
import { _Model, Model, Collection } from './entities/programs';

const Entity = BaseEntity.extend({
  Entity: { _Model, Model, Collection },
  radioRequests: {
    'programs:model': 'getModel',
    'programs:collection': 'getCollection',
    'fetch:programs:model': 'fetchModel',
    'fetch:programs:collection': 'fetchCollection',
    'fetch:program:model:byAction': 'fetchProgramByAction',
    'fetch:programs:model:byProgramFlow': 'fetchProgramByProgramFlow',
    'fetch:programs:model:byFlow': 'fetchProgramByFlow',
  },
  fetchProgramByAction(actionId) {
    const program = Radio.request('entities', 'programs:model');
    return program.fetch({ url: `/api/actions/${ actionId }/program` });
  },
  fetchProgramByProgramFlow(flowId) {
    const program = Radio.request('entities', 'programs:model');
    return program.fetch({ url: `/api/program-flows/${ flowId }/program` });
  },
  fetchProgramByFlow(flowId) {
    const program = Radio.request('entities', 'programs:model');
    return program.fetch({ url: `/api/flows/${ flowId }/program` });
  },
});

export default new Entity();
