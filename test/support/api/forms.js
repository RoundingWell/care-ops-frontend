import _ from 'underscore';
import { getResource } from 'helpers/json-api';

Cypress.Commands.add('routeForms', (mutator = _.identity) => {
  cy
    .fixture('collections/forms').as('fxForms')
    .fixture('test/forms').as('fxTestForms');

  cy.route({
    url: '/api/forms',
    response() {
      return mutator({
        data: getResource(_.union(this.fxTestForms, _.sample(this.fxForms, 5)), 'forms'),
        included: [],
      });
    },
  })
    .as('routeForms');
});
