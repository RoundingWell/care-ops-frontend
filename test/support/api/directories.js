import _ from 'underscore';

Cypress.Commands.add('routeDirectories', (mutator = _.identity) => {
  cy.route({
    url: '/api/directories*',
    response() {
      return mutator({
        data: null,
        included: [],
      });
    },
  })
    .as('routeDirectories');
});
