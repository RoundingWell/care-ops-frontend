import _ from 'underscore';

function getResource(data, type, relationships = {}) {
  data = JSON.parse(JSON.stringify(data));

  if (_.isArray(data)) {
    return _.map(data, _.partial(getResource, _, type, relationships));
  }

  if (_.isFunction(relationships)) relationships = relationships();
  relationships = JSON.parse(JSON.stringify(relationships));

  return {
    id: data.id,
    type,
    attributes: _.omit(data, 'id'),
    relationships,
  };
}

function getRelationship(resource, type) {
  if (!resource) return { data: null };

  if (_.isString(resource)) return getRelationship({ id: resource }, type);

  if (_.isArray(resource)) {
    return {
      data: _.map(resource, ({ id }) => {
        return { id, type };
      }),
    };
  }

  return {
    data: {
      id: resource.id,
      type,
    },
  };
}

function getError(detail, key) {
  return {
    source: { pointer: `/data/attributes/${ key }` },
    detail,
  };
}

export {
  getError,
  getResource,
  getRelationship,
};
