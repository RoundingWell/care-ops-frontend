import _ from 'underscore';
import { getResource } from 'helpers/json-api';

Cypress.Commands.add('routeActionComments', (mutator = _.identity) => {
  cy
    .fixture('collections/comments').as('fxComments');

  cy.route({
    url: '/api/actions/**/relationships/comments',
    response() {
      const data = getResource(_.sample(this.fxComments, 5), 'comments');

      return mutator({
        data,
        included: [],
      });
    },
  })
    .as('routeActionComments');
});
