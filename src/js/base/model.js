import _ from 'underscore';
import Backbone from 'backbone';
import { getActiveXhr, registerXhr } from './control';
import JsonApiMixin from './jsonapi-mixin';

export default Backbone.Model.extend(_.extend({
  fetch(options) {
    // Model fetches default to aborting.
    options = _.extend({ abort: true }, options);

    const baseUrl = _.result(this, 'url');
    let xhr = getActiveXhr(baseUrl, options);

    /* istanbul ignore if */
    if (!xhr) {
      xhr = Backbone.Model.prototype.fetch.call(this, options);

      registerXhr(baseUrl, xhr);
    }

    return xhr;
  },
  parse(response) {
    /* istanbul ignore if */
    if (!response || !response.data) return response;

    this.cacheIncluded(response.included);

    return this.parseModel(response.data);
  },
  parseErrors({ errors }) {
    if (!errors) return;

    const attrPointer = '/data/attributes/';

    return _.reduce(errors, (parsedErrors, { source, detail }) => {
      const key = String(source.pointer).slice(attrPointer.length);
      parsedErrors[key] = detail;
      return parsedErrors;
    }, []);
  },
  removeReadOnly(attrs) {
    // Removes read-only fields for POST/PUTs
    return _.pick(attrs, function(value, key) {
      return !_.startsWith(key, '_');
    });
  },
  toJSONApi(attributes) {
    return {
      id: this.id,
      type: this.type,
      attributes: this.removeReadOnly(attributes),
    };
  },
  toJSON() {
    return this.toJSONApi(this.attributes);
  },
  patch(attrs, data = {}, opts) {
    data = _.extend(this.toJSONApi(data.attributes || attrs), data);

    if (_.isEmpty(data.attributes)) delete data.attributes;

    opts = _.extend({
      patch: true,
      data: JSON.stringify({ data }),
    }, opts);

    return this.save(attrs, opts);
  },
  isCached() {
    return this.has('__cached_ts');
  },
  invalidateCache() {
    this.unset('__cached_ts');
  },
}, JsonApiMixin));
