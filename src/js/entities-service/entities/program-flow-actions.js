import _ from 'underscore';
import Radio from 'backbone.radio';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'program-flow-actions';

const _Model = BaseModel.extend({
  url() {
    return `/api/program-flows/${ this.get('_program_flow') }/relationships/actions`;
  },
  type: TYPE,
  getAction() {
    return Radio.request('entities', 'programActions:model', this.get('_program_action'));
  },
  saveAll(attrs) {
    attrs = _.extend({}, this.attributes, attrs);
    const relationships = {
      'program-flow': this.toRelation(attrs._program_flow, 'program-flows'),
      'program-action': this.toRelation(attrs._program_action, 'program-actions'),
    };

    return this.save(attrs, { relationships }, { wait: true });
  },
});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  initialize({ flowId }) {
    this.flowId = flowId;
  },
  url() {
    return `/api/program-flows/${ this.flowId }/relationships/actions`;
  },
  model: Model,
  comparator: 'sequence',
  getByAction({ id }) {
    return this.find({ _program_action: id });
  },
});

export {
  _Model,
  Model,
  Collection,
};
