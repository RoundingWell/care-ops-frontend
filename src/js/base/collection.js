import $ from 'jquery';
import { bind, clone, invoke, extend, map, result } from 'underscore';
import Backbone from 'backbone';

import { getActiveXhr, registerXhr } from './control';
import JsonApiMixin from './jsonapi-mixin';

export default Backbone.Collection.extend(extend({
  fetch(options = {}) {
    const baseUrl = options.url || result(this, 'url');
    let xhr = getActiveXhr(baseUrl, options);

    /* istanbul ignore if */
    if (!xhr) {
      xhr = Backbone.Collection.prototype.fetch.call(this, options);

      registerXhr(baseUrl, xhr);
    }

    // On success resolves the entity instead of the jqxhr success
    const d = $.Deferred();

    d.abort = xhr.abort;

    $.when(xhr)
      .fail(bind(d.reject, d))
      .done(bind(d.resolve, d, this));

    return d;
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

    return $.when(...destroys);
  },
}, JsonApiMixin));
