import _ from 'underscore';

Cypress.Commands.add('routeActionFiles', (mutator = _.identity) => {
  cy.intercept('GET', '/api/actions/**/relationships/files?urls=download,view', {
    body: mutator({
      data: [],
      included: [],
    }),
  })
    .as('routeActionFiles');
});
