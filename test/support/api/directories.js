import _ from 'underscore';

Cypress.Commands.add('routeDirectories', (mutator = _.identity) => {
  cy.intercept('GET', '/api/directories*', {
    body: mutator({
      data: [],
      included: [],
    }),
  })
    .as('routeDirectories');
});
