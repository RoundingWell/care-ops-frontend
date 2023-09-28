import _ from 'underscore';
import { getResource } from 'helpers/json-api';

import fxTestDashboards from 'fixtures/test/dashboards';

Cypress.Commands.add('routeDashboards', (mutator = _.identity) => {
  cy.intercept('GET', '/api/dashboards', {
    body: mutator({
      data: getResource(fxTestDashboards, 'dashboards'),
      included: [],
    }),
  })
    .as('routeDashboards');
});

Cypress.Commands.add('routeDashboard', (mutator = _.identity) => {
  cy.intercept('GET', '/api/dashboards/*', {
    body: mutator({
      data: getResource(_.sample(fxTestDashboards), 'dashboards'),
      included: [],
    }),
  })
    .as('routeDashboard');
});
