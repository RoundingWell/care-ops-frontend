import _ from 'underscore';

function getResource(data, type) {
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
  if (!resource) return;

  if (_.isArray(resource)) {
    return _.map(resource, _.partial(getRelationship, _, type));
  }

  return {
    id: resource.id,
    type,
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
