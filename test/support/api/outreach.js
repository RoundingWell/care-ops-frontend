import _ from 'underscore';

Cypress.Commands.add('routeOutreachStatus', (mutator = _.identity) => {
  cy.route({
    url: '/api/outreach?*',
    response() {
      return mutator({
        data: {
          type: 'Outreach',
          id: '11111',
          attributes: {
            phone_end: '1234',
          },
        },
        included: [],
      });
    },
  })
    .as('routeOutreachStatus');
});
