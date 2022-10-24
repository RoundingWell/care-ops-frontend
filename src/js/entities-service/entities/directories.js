import { map } from 'underscore';

import BaseCollection from 'js/base/collection';
import BaseModel from 'js/base/model';

const TYPE = 'directories';

const Model = BaseModel.extend({
  type: TYPE,
  url() {
    return `/api/directory/${ this.get('slug') }`;
  },
  getOptions() {
    if (this.options) return this.options;

    const options = map(this.get('value'), value => {
      return {
        name: value,
        id: value,
      };
    });

    this.options = new BaseCollection(options);

    return this.options;
  },
});

const Collection = BaseCollection.extend({
  url: '/api/directories',
  model: Model,
});

export {
  Model,
  Collection,
};
