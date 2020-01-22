import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'patients-search-results';

const Model = BaseModel.extend({
  type: TYPE,
});

const Collection = BaseCollection.extend({
  url: '/api/patients',
  model: Model,
});

export {
  Collection,
};
