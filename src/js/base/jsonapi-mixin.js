import _ from 'underscore';
import moment from 'moment';
import Store from 'backbone.store';

export default {
  cacheIncluded(included) {
    _.each(included, data => {
      const Model = Store.get(data.type);
      const model = new Model({ id: data.id });
      model.set(model.parseModel(data));
    });
  },
  // Override to handle specific id parsing
  parseId(attrs = {}, id) {
    attrs.id = id;

    return attrs;
  },
  // Override to handle specific relationships
  parseRelationship(relationship) {
    if (!relationship) return relationship;

    if (!_.isArray(relationship)) {
      return relationship.id;
    }

    return _.map(relationship, item => {
      const itemRelationship = { id: item.id };

      if (item.meta) itemRelationship._meta = item.meta;

      return itemRelationship;
    });
  },
  // Creates model relationship ie: _factors: [{id: '1'}, {id: '2'}]
  parseRelationships(attrs, relationships) {
    _.each(relationships, (relationship, key) => {
      attrs[`_${ _.underscored(key) }`] = this.parseRelationship(relationship.data, key);
    });

    return attrs;
  },
  parseModel(data) {
    const modelData = this.parseId(data.attributes, data.id);

    modelData.__cached_ts = moment.utc().format();

    return this.parseRelationships(modelData, data.relationships);
  },
  toRelation(data, type) {
    if (_.isUndefined(data)) return;

    if (_.isArray(data)) {
      const collectionData = _.map(data, ({ id }) => {
        return { id, type };
      });

      return {
        data: collectionData,
      };
    }

    if (_.isNull(data)) {
      return {
        data: { id: 0, type },
      };
    }

    return {
      data: { id: data, type },
    };
  },
};
