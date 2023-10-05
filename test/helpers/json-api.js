import _ from 'underscore';

function getResource(data, type) {
  data = JSON.parse(JSON.stringify(data));

  if (_.isArray(data)) {
    return _.map(data, _.partial(getResource, _, type));
  }

  return {
    id: data.id,
    type,
    attributes: _.omit(data, 'id'),
    relationships: {},
  };
}

function getIncluded(included = [], data, type) {
  const resource = getResource(data, type);

  if (_.isArray(resource)) {
    included.push(...resource);
    return included;
  }

  included.push(resource);
  return included;
}

function getRelationship(resource, type) {
  if (!resource) return { data: null };

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
  getIncluded,
  getRelationship,
};
