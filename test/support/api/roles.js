import _ from 'underscore';
import { getResource } from 'helpers/json-api';

Cypress.Commands.add('routeRoles', (mutator = _.identity) => {
  cy
    .fixture('test/roles').as('fxTestRoles');

  cy.route({
    url: '/api/roles',
    response() {
      return mutator({
        data: getResource(this.fxTestRoles, 'roles'),
        included: [],
      });
    },
  })
    .as('routeRoles');
});
