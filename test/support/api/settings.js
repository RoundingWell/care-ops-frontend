import _ from 'underscore';
import { getResource } from 'helpers/json-api';

import fxTestSettings from 'fixtures/test/settings';

const TYPE = 'settings';

Cypress.Commands.add('routeSettings', (mutator = _.identity) => {
  const data = getResource(fxTestSettings, TYPE);

  cy
    .intercept('GET', '/api/settings', {
      body: mutator({ data, included: [] }),
    })
    .as('routeSettings');
});
