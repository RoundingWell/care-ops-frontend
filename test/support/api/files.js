import _ from 'underscore';

Cypress.Commands.add('routeActionFiles', (mutator = _.identity) => {
  cy.route({
    url: '/api/actions/**/relationships/files',
    response() {
      return mutator({
        data: [],
        included: [],
      });
    },
  })
    .as('routeActionFiles');
});
