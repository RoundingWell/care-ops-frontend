import _ from 'underscore';
import { getResource } from 'helpers/json-api';

import fxTestRoles from 'fixtures/test/roles';

Cypress.Commands.add('routeRoles', (mutator = _.identity) => {
  cy.intercept('GET', '/api/roles', {
    body: mutator({
      data: getResource(fxTestRoles, 'roles'),
      included: [],
    }),
  })
    .as('routeRoles');
});
