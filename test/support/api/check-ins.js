import _ from 'underscore';
import { getResource } from 'helpers/json-api';

Cypress.Commands.add('routePatientCheckIn', (mutator = _.identity) => {
  cy
    .fixture('collections/check-ins').as('fxCheckIns');

  cy.route({
    url: /api\/patients\/.\/checkins\?filter\[checkin\]/,
    response() {
      return mutator({
        data: getResource(_.sample(this.fxCheckIns), 'check-ins'),
        included: [],
      });
    },
  })
    .as('routePatientCheckIn');
});
