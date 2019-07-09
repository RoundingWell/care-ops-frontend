import _ from 'underscore';
import { getResource } from 'helpers/json-api';

Cypress.Commands.add('routeActionActivity', (mutator = _.identity) => {
  cy
    .fixture('collections/events').as('fxEvents');

  cy.route({
    url: '/api/actions/**/activity*',
    response() {
      return mutator({
        data: getResource(_.sample(this.fxEvents, 5), 'events'),
      });
    },
  })
    .as('routeActionActivity');
});
