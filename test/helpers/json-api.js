import _ from 'underscore';

// NOTE: Set this to true to check for invalid types and relationships
const DEBUG = false;

const VALID_TYPES = [
  'actions',
  'clinicians',
  'comments',
  'dashboards',
  'directories',
  'events',
  'files',
  'flows',
  'form-responses',
  'forms',
  'outreach',
  'patient-fields',
  'patient-search-results',
  'patients',
  'program-actions',
  'program-flows',
  'programs',
  'roles',
  'settings',
  'states',
  'tags',
  'teams',
  'widgets',
  'workspaces',
];

const VALID_RELATIONSHIPS = [
  'action',
  'actions',
  'files',
  'flow',
  'form',
  'owner',
  'patient',
  'patient-fields',
  'program',
  'program-action',
  'program-flow',
  'role',
  'state',
  'team',
  'workspaces',
];

function debugType(data) {
  if (!DEBUG) return;

  if (!VALID_TYPES.includes(data.type)) {
    Cypress.log({
      name: 'mergeJsonApi',
      displayName: 'json-api',
      message: 'WARNING: Invalid type',
      consoleProps: () => {
        return { data, type: data.type };
      },
    });
  }
}

function debugRelationships(data, VALID = {}) {
  if (!DEBUG) return;

  const RELATIONSHIPS = VALID.relationships || VALID_RELATIONSHIPS;

  const invalidRelationships = _.reject(_.keys(data.relationships), relationship => {
    return RELATIONSHIPS.includes(relationship);
  });

  if (invalidRelationships.length) {
    Cypress.log({
      name: 'mergeJsonApi',
      displayName: 'json-api',
      message: 'WARNING: Invalid Relationship',
      consoleProps: () => {
        return {
          data,
          invalidRelationships,
        };
      },
    });
  }
}

function debugData(data, { VALID } = {}) {
  debugType(data);
  debugRelationships(data, VALID);

  return data;
}

function getResource(data, type, relationships = {}) {
  data = JSON.parse(JSON.stringify(data));

  if (_.isArray(data)) {
    return _.map(data, _.partial(getResource, _, type, relationships));
  }

  if (_.isFunction(relationships)) relationships = relationships();
  relationships = JSON.parse(JSON.stringify(relationships));

  return debugData({
    id: data.id,
    type,
    attributes: _.omit(data, 'id'),
    relationships,
  });
}

function getRelationship(resource, type) {
  if (!resource) return { data: null };

  debugType({ type });

  if (_.isString(resource)) return getRelationship({ id: resource }, type);

  if (_.isArray(resource)) {
    if (_.isEmpty(resource)) return { data: [] };
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
// Note: mergeData { id, type, attributes, relationships, meta }
function mergeJsonApi(data = {}, mergeData = {}, _debugData) {
  data = JSON.parse(JSON.stringify(data));
  data.id = _.result(mergeData, 'id', data.id);
  data.type = _.result(mergeData, 'type', data.type);
  data.attributes = _.defaults(_.result(mergeData, 'attributes'), data.attributes);
  data.relationships = _.defaults(_.result(mergeData, 'relationships'), data.relationships);
  data.meta = _.defaults(_.result(mergeData, 'meta'), data.meta);

  return debugData(JSON.parse(JSON.stringify(data)), _debugData);
}

export {
  getError,
  getResource,
  getRelationship,
  mergeJsonApi,
};
