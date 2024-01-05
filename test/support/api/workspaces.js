import _ from 'underscore';
import { getResource, getRelationship, mergeJsonApi } from 'helpers/json-api';

import fxTestWorkspaces from 'fixtures/test/workspaces.json';

import { getClinicians } from './clinicians';
import { getForms } from './forms';
import { getStates } from './states';

const TYPE = 'workspaces';

export function getWorkspaces(data, { depth = 0 } = {}) {
  if (depth++ > 2) return;

  const defaultRelationships = {
    clinicians: getRelationship(getClinicians({}, { depth })),
    forms: getRelationship(getForms()),
    states: getRelationship(getStates()),
  };

  const resource = getResource(fxTestWorkspaces, TYPE, defaultRelationships);

  return mergeJsonApi(resource, data, { VALID: { relationships: _.keys(defaultRelationships) } });
}

const workspaces = getResource(fxTestWorkspaces, TYPE);

// Exporting only workspaces needed for testing variance
export const workspaceOne = _.find(workspaces, { id: '11111' });
export const workspaceTwo = _.find(workspaces, { id: '22222' });

Cypress.Commands.add('routeWorkspaces', (mutator = _.identity) => {
  const data = getWorkspaces();

  cy
    .intercept('GET', '/api/workspaces', {
      body: mutator({ data, included: [] }),
    })
    .as('routeWorkspaces');
});
