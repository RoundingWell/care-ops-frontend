import Store from 'backbone.store';
import BaseModel from 'js/base/model';

const TYPE = 'workspace-patients';

const _Model = BaseModel.extend({
  type: TYPE,
  urlRoot: '/api/workspace-patients',
});

const Model = Store(_Model, TYPE);

export {
  _Model,
  Model,
};
