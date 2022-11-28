import { clone, invoke, extend, map, result } from 'underscore';
import Backbone from 'backbone';

import { getActiveFetcher, registerFetcher } from './control';
import JsonApiMixin from './jsonapi-mixin';

export default Backbone.Collection.extend(extend({
  fetch(options = {}) {
    const baseUrl = options.url || result(this, 'url');
    let fetcher = getActiveFetcher(baseUrl, options);

    /* istanbul ignore if */
    if (!fetcher) {
      fetcher = Backbone.Collection.prototype.fetch.call(this, options);

      registerFetcher(baseUrl, fetcher);
    }

    // Resolve with entity if successful
    return fetcher.then(response => {
      return this;
    });
  },
  parse(response) {
    /* istanbul ignore if */
    if (!response || !response.data) return response;

    this.cacheIncluded(response.included);

    return map(response.data, this.parseModel, this);
  },
  destroy(options) {
    const models = clone(this.models);

    const destroys = invoke(models, 'destroy', options);

    return Promise.all(destroys);
  },
}, JsonApiMixin));
