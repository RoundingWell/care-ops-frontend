import _ from 'underscore';
import { getResource } from 'helpers/json-api';

import fxTestTeams from 'fixtures/test/teams';

Cypress.Commands.add('routeTeams', (mutator = _.identity) => {
  cy.intercept('GET', '/api/teams', {
    body: mutator({
      data: getResource(fxTestTeams, 'teams'),
      included: [],
    }),
  })
    .as('routeTeams');
});
