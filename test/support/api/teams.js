import _ from 'underscore';
import { getResource } from 'helpers/json-api';

import fxTestTeams from 'fixtures/test/teams';

const TYPE = 'teams';

export function getTeam() {
  return getResource(_.sample(fxTestTeams), TYPE);
}

export function getTeams() {
  return getResource(fxTestTeams, TYPE);
}

const teams = getTeams();

// Exporting only teams needed for testing variance
export const teamCoordinator = _.find(teams, { id: '11111' });
export const teamNurse = _.find(teams, { id: '22222' });
export const teamOther = _.find(teams, { id: '77777' });

Cypress.Commands.add('routeTeams', (mutator = _.identity) => {
  const data = getTeams();

  cy
    .intercept('GET', '/api/teams', {
      body: mutator({ data, included: [] }),
    })
    .as('routeTeams');
});
