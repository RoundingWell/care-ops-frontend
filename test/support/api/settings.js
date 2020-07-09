import _ from 'underscore';
import { getResource } from 'helpers/json-api';

Cypress.Commands.add('routeSettings', (mutator = _.identity) => {
  cy
    .fixture('test/settings').as('fxTestSettings');

  cy.route({
    url: '/api/settings',
    response() {
      return mutator({
        data: getResource(this.fxTestSettings, 'settings'),
        included: [],
      });
    },
  })
    .as('routeSettings');
});
