import _ from 'underscore';
import dayjs from 'dayjs';
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

      if (item.meta) {
        _.each(item.meta, (value, key) => {
          itemRelationship[`_${ _.underscored(key) }`] = value;
        });
      }

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

    modelData.__cached_ts = dayjs.utc().format();

    _.each(data.meta, (value, key) => {
      modelData[`_${ _.underscored(key) }`] = value;
    });

    return this.parseRelationships(modelData, data.relationships);
  },
  toRelation(entity, entityType) {
    if (_.isUndefined(entity)) return;

    if (_.isNull(entity)) return { data: null };

    if (entity.models) {
      return {
        data: entity.map(({ id, type }) => {
          return { id, type };
        }),
      };
    }

    if (_.isArray(entity)) {
      return {
        data: _.map(entity, ({ id }) => {
          return { id, type: entityType };
        }),
      };
    }

    if (_.isObject(entity)) {
      return { data: _.pick(entity, 'id', 'type') };
    }

    return {
      data: {
        id: entity,
        type: entityType,
      },
    };
  },
};
