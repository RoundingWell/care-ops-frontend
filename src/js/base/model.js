import { extend, isEmpty, pick, reduce } from 'underscore';
import Backbone from 'backbone';
import JsonApiMixin from './jsonapi-mixin';

export default Backbone.Model.extend(extend({
  destroy(options) {
    if (this.isNew()) {
      Backbone.Model.prototype.destroy.call(this, options);
      return Promise.resolve(options);
    }

    return Backbone.Model.prototype.destroy.call(this, options);
  },
  fetch(options) {
    // Model fetches default to aborting.
    const fetcher = Backbone.Model.prototype.fetch.call(this, extend({ abort: true }, options));

    // Resolve with entity if successful
    return fetcher.then(response => {
      if (!response || response.ok) return this;

      return response;
    });
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

    return reduce(errors, (parsedErrors, { source, detail }) => {
      const key = String(source.pointer).slice(attrPointer.length);
      parsedErrors[key] = detail;
      return parsedErrors;
    }, {});
  },
  removeFEOnly(attrs) {
    // Removes id and frontend _fields for POST/PATCHes
    return pick(attrs, function(value, key) {
      return key !== 'id' && /^[^_]/.test(key);
    });
  },
  toJSONApi(attributes = this.attributes) {
    return {
      id: this.id,
      type: this.type,
      attributes: this.removeFEOnly(attributes),
    };
  },
  save(attrs, data = {}, opts) {
    // Supports the prototype overloading
    if (attrs == null) opts = data;

    data = extend(this.toJSONApi(data.attributes || attrs), data);

    if (isEmpty(data.attributes)) delete data.attributes;

    opts = extend({
      patch: !this.isNew(),
      data: JSON.stringify({ data }),
    }, opts);

    return Backbone.Model.prototype.save.call(this, attrs, opts);
  },
  isCached() {
    return this.has('__cached_ts');
  },
}, JsonApiMixin));
