import _ from 'underscore';

Cypress.Commands.add('routePatientEvents', (mutator = _.identity) => {
  cy
    .fixture('collections/patient-events').as('fxEvents');

  cy.route({
    url: '/api/patients/**/relationships/events*',
    response() {
      return mutator({
        data: this.fxEvents,
      });
    },
  })
    .as('routePatientEvents');
});
