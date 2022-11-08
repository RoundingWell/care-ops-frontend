import _ from 'underscore';

Cypress.Commands.add('routeTags', (mutator = _.identity) => {
  cy.route({
    url: '/api/tags',
    response() {
      return mutator({
        data: ['foo-tag'],
      });
    },
  })
    .as('routeTags');
});
