import _ from 'underscore';
import { getResource } from 'helpers/json-api';

import fxTestSettings from 'fixtures/test/settings';

Cypress.Commands.add('routeSettings', (mutator = _.identity) => {
  cy.intercept('GET', '/api/settings', {
    body: mutator({
      data: getResource(fxTestSettings, 'settings'),
      included: [],
    }),
  })
    .as('routeSettings');
});
