import Radio from 'backbone.radio';
import Store from 'backbone.store';
import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'flow-actions';

const _Model = BaseModel.extend({
  url() {
    return `/api/flows/${ this.get('_flow') }/relationships/actions`;
  },
  type: TYPE,
  getAction() {
    return Radio.request('entities', 'actions:model', this.get('_action'));
  },
});

const Model = Store(_Model, TYPE);
const Collection = BaseCollection.extend({
  initialize({ flowId }) {
    this.flowId = flowId;
  },
  url() {
    return `/api/flows/${ this.flowId }/relationships/actions`;
  },
  model: Model,
  comparator: 'sequence',
});

export {
  _Model,
  Model,
  Collection,
};
