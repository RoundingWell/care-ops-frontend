import _ from 'underscore';
import { getResource } from 'helpers/json-api';

import fxTestWidgets from 'fixtures/test/widgets';

Cypress.Commands.add('routeWidgets', (mutator = _.identity) => {
  cy.intercept('GET', '/api/widgets*', {
    body: mutator({
      data: getResource(fxTestWidgets, 'widgets'),
      included: [],
    }),
  })
    .as('routeWidgets');
});
