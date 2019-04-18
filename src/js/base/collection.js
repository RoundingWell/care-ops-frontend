import _ from 'underscore';
import Backbone from 'backbone';

import { getActiveXhr, registerXhr } from './control';
import JsonApiMixin from './jsonapi-mixin';

export default Backbone.Collection.extend(_.extend({
  fetch(options) {
    const baseUrl = _.result(this, 'url');
    let xhr = getActiveXhr(baseUrl, options);

    /* istanbul ignore if */
    if (!xhr) {
      xhr = Backbone.Collection.prototype.fetch.call(this, options);

      registerXhr(baseUrl, xhr);
    }

    return xhr;
  },
  parse(response) {
    /* istanbul ignore if */
    if (!response || !response.data) return response;

    this.cacheIncluded(response.included);

    return _.map(response.data, this.parseModel, this);
  },
}, JsonApiMixin));
