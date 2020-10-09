import _ from 'underscore';
import { getResource } from 'helpers/json-api';

Cypress.Commands.add('routeWidgets', (mutator = _.identity) => {
  cy
    .fixture('test/widgets').as('fxTestWidgets');

  cy.route({
    url: '/api/widgets*',
    response() {
      return mutator({
        data: getResource(this.fxTestWidgets, 'widgets'),
        included: [],
      });
    },
  })
    .as('routeWidgets');
});
