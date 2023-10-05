import _ from 'underscore';

Cypress.Commands.add('routeOutreachStatus', (mutator = _.identity) => {
  cy.intercept('GET', '/api/outreach?*', {
    body: mutator({
      data: {
        type: 'outreach',
        id: '11111',
        attributes: {
          phone_end: '1234',
        },
      },
      included: [],

    }),
  })
    .as('routeOutreachStatus');
});
