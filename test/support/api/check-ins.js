import _ from 'underscore';
import { getResource } from 'helpers/json-api';

Cypress.Commands.add('routePatientCheckin', (mutator = _.identity) => {
  cy
    .fixture('collections/check-ins').as('fxCheckIns');

  cy.route({
    url: '/api/check-ins/*',
    response() {
      return mutator({
        data: getResource(_.sample(this.fxCheckIns), 'check-ins'),
        included: [],
      });
    },
  })
    .as('routePatientCheckin');
});
