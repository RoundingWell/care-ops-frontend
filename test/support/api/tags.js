import _ from 'underscore';

Cypress.Commands.add('routeTags', (mutator = _.identity) => {
  cy.intercept('GET', '/api/tags', {
    body: mutator({
      data: ['foo-tag'],
    }),
  })
    .as('routeTags');
});
