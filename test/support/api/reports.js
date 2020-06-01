import _ from 'underscore';
import { getResource } from 'helpers/json-api';

Cypress.Commands.add('routeReports', (mutator = _.identity) => {
  cy
    .fixture('test/reports').as('fxTestReports');

  cy.route({
    url: '/api/reports',
    response() {
      return mutator({
        data: getResource(this.fxTestReports, 'reports'),
        included: [],
      });
    },
  })
    .as('routeReports');
});

Cypress.Commands.add('routeReport', (mutator = _.identity) => {
  cy
    .fixture('test/reports').as('fxTestReports');

  cy.route({
    url: '/api/reports/*',
    response() {
      return mutator({
        data: getResource(_.sample(this.fxTestReports), 'reports'),
        included: [],
      });
    },
  })
    .as('routeReport');
});
