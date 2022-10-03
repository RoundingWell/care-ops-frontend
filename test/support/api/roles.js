import _ from 'underscore';
import { getResource } from 'helpers/json-api';
import fxTestRoles from 'fixtures/test/roles.json';

Cypress.Commands.add('routeRoles', (mutator = _.identity) => {
  cy.route({
    url: '/api/roles',
    response() {
      return mutator({
        data: getResource(fxTestRoles, 'roles'),
        included: [],
      });
    },
  })
    .as('routeRoles');
});
