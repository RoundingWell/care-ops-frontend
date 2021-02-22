import _ from 'underscore';
import { getResource } from 'helpers/json-api';

Cypress.Commands.add('routeDashboards', (mutator = _.identity) => {
  cy
    .fixture('test/dashboards').as('fxTestDashboards');

  cy.route({
    url: '/api/dashboards',
    response() {
      return mutator({
        data: getResource(this.fxTestDashboards, 'dashboards'),
        included: [],
      });
    },
  })
    .as('routeDashboards');
});

Cypress.Commands.add('routeDashboard', (mutator = _.identity) => {
  cy
    .fixture('test/dashboards').as('fxTestDashboards');

  cy.route({
    url: '/api/dashboards/*',
    response() {
      return mutator({
        data: getResource(_.sample(this.fxTestDashboards), 'dashboards'),
        included: [],
      });
    },
  })
    .as('routeDashboard');
});
