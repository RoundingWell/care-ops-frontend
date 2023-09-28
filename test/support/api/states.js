import _ from 'underscore';
import { getResource } from 'helpers/json-api';

import fxTestStates from 'fixtures/test/states';

Cypress.Commands.add('routeStates', (mutator = _.identity) => {
  cy.intercept('GET', '/api/states', {
    body: mutator({
      data: getResource(fxTestStates, 'states'),
      included: [],
    }),
  })
    .as('routeStates');
});
