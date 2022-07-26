import _ from 'underscore';
import { getResource } from 'helpers/json-api';

Cypress.Commands.add('routeTeams', (mutator = _.identity) => {
  cy
    .fixture('test/teams').as('fxTestTeams');

  cy.route({
    url: '/api/teams',
    response() {
      return mutator({
        data: getResource(this.fxTestTeams, 'teams'),
        included: [],
      });
    },
  })
    .as('routeTeams');
});
