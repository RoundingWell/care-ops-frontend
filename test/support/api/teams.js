import _ from 'underscore';
import { getResource, getRelationship, mergeJsonApi } from 'helpers/json-api';

import fxTestTeams from 'fixtures/test/teams';

import { getCurrentClinician } from './clinicians';

const TYPE = 'teams';

function getFixture(data) {
  if (!data) return _.sample(fxTestTeams);

  if (!data.id) data.id = _.sample(fxTestTeams).id;

  return _.find(fxTestTeams, { id: data.id }) || _.extend({}, _.sample(fxTestTeams), { id: data.id });
}

function getTeamResource(data, defaultRelationships) {
  const resource = getResource(getFixture(data), TYPE, defaultRelationships);

  return resource;
}

export function getTeam(data, { depth = 0 } = {}) {
  if (depth++ > 2) return;

  const currentClinician = getCurrentClinician({}, { depth });

  const defaultRelationships = {
    'clinicians': getRelationship([currentClinician]),
  };

  const resource = getTeamResource(data, defaultRelationships);

  return mergeJsonApi(resource, data, { VALID: { relationships: _.keys(defaultRelationships) } });
}

export function getTeams({ attributes, relationships, meta } = {}, { depth = 0 } = {}) {
  if (depth + 1 > 2) return [];

  const clinicians = _.map(fxTestTeams, fxTeam => {
    const resource = getTeam(fxTeam, { depth });

    return mergeJsonApi(resource, { attributes, relationships, meta });
  });

  return clinicians;
}

// Exporting only teams needed for testing variance
export const teamCoordinator = getTeamResource({ id: '11111' });
export const teamNurse = getTeamResource({ id: '22222' });
export const teamOther = getTeamResource({ id: '77777' });

Cypress.Commands.add('routeTeams', (mutator = _.identity) => {
  const data = getTeams();

  cy
    .intercept('GET', '/api/teams', {
      body: mutator({ data, included: [] }),
    })
    .as('routeTeams');
});
