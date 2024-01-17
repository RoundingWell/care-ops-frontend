import _ from 'underscore';
import { v5 as uuid, NIL as NIL_UUID } from 'uuid';
import { getResource, getRelationship, mergeJsonApi } from 'helpers/json-api';

import fxTestWorkspaces from 'fixtures/test/workspaces.json';

import { getClinicians } from './clinicians';
import { getForms } from './forms';
import { getStates } from './states';

const TYPE = 'workspaces';

function getFixture(data) {
  if (!data) return _.sample(fxTestWorkspaces);

  if (!data.id) throw new Error('Workspace id must be specified for overriding getWorkspace');

  return _.find(fxTestWorkspaces, { id: data.id }) || _.extend({}, _.sample(fxTestWorkspaces), { id: data.id });
}

function getWorkspaceResource(data, defaultRelationships) {
  const resource = getResource(getFixture(data), TYPE, defaultRelationships);

  resource.id = uuid(resource.id, NIL_UUID);

  return resource;
}

export function getWorkspace(data, { depth = 0 } = {}) {
  if (depth++ > 2) return;

  const defaultRelationships = {
    'clinicians': getRelationship(getClinicians({}, { depth })),
    'forms': getRelationship(getForms()),
    'states': getRelationship(getStates()),
  };

  const resource = getWorkspaceResource(data, defaultRelationships);

  return mergeJsonApi(resource, _.omit(data, 'id'), { VALID: { relationships: _.keys(defaultRelationships) } });
}

export function getWorkspaces({ attributes, relationships, meta } = {}, { depth = 0 } = {}) {
  if (depth + 1 > 2) return;

  const workspaces = _.map(fxTestWorkspaces, fxTestWorkspace => {
    const resource = getWorkspace(fxTestWorkspace, { depth });

    return mergeJsonApi(resource, { attributes, relationships, meta });
  });

  return workspaces;
}

// Exporting only workspaces needed for testing variance
export const workspaceOne = getWorkspaceResource({ id: '11111' });
export const workspaceTwo = getWorkspaceResource({ id: '22222' });

Cypress.Commands.add('routeWorkspaces', (mutator = _.identity) => {
  const data = getWorkspaces();

  cy
    .intercept('GET', '/api/workspaces', {
      body: mutator({ data, included: [] }),
    })
    .as('routeWorkspaces');
});

