import _ from 'underscore';
import { getResource } from 'helpers/json-api';

Cypress.Commands.add('routePatientCheckIn', (mutator = _.identity) => {
  cy
    .fixture('test/check-in-response').as('fxCheckInResponse');

  cy.route({
    url: /api\/patients\/.\/checkins\?filter\[checkin\]/,
    response() {
      return mutator({
        data: getResource(this.fxCheckInResponse, 'check-ins'),
        included: [],
      });
    },
  })
    .as('routePatientCheckIn');
});
