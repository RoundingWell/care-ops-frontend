import _ from 'underscore';
import { getResource } from 'helpers/json-api';

import fxTestDashboards from 'fixtures/test/dashboards';

const TYPE = 'dashboards';

Cypress.Commands.add('routeDashboards', (mutator = _.identity) => {
  const data = getResource(fxTestDashboards, TYPE);

  cy
    .intercept('GET', '/api/dashboards', {
      body: mutator({ data, included: [] }),
    })
    .as('routeDashboards');
});

Cypress.Commands.add('routeDashboard', (mutator = _.identity) => {
  const data = getResource(_.sample(fxTestDashboards), TYPE);

  cy
    .intercept('GET', '/api/dashboards/*', {
      body: mutator({ data, included: [] }),
    })
    .as('routeDashboard');
});
