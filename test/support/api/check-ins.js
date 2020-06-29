import _ from 'underscore';

Cypress.Commands.add('routePatientCheckIn', (mutator = _.identity) => {
  cy
    .fixture('test/check-in-response').as('fxCheckInResponse');

  cy.route({
    url: /api\/patients\/.\/checkins\?filter\[checkin\]/,
    response() {
      return mutator({
        data: {
          checkin: this.fxCheckInResponse,
        },
      });
    },
  })
    .as('routePatientCheckIn');
});
