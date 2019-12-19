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
    if (this.isNew()) return this.get('_new_action');

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
  getByAction(action) {
    const flowAction = this.find({ _program_action: action.id });

    if (!flowAction) {
      return this.find({ _new_action: action });
    }

    return flowAction;
  },
  updateSequences() {
    const data = this.map((flowAction, index) => {
      flowAction.set('sequence', index);
      return flowAction.toJSONApi();
    });

    return this.sync('patch', this, {
      url: this.url(),
      data: JSON.stringify({ data }),
    });
  },
});

export {
  _Model,
  Model,
  Collection,
};
