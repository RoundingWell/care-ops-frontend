import _ from 'underscore';
import { getResource } from 'helpers/json-api';

Cypress.Commands.add('routeStates', (mutator = _.identity) => {
  cy
    .fixture('test/states').as('fxTestStates');

  cy.route({
    url: '/api/states',
    response() {
      return mutator({
        data: getResource(this.fxTestStates, 'states'),
        included: [],
      });
    },
  })
    .as('routeStates');
});
