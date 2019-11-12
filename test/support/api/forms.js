import _ from 'underscore';
import { getResource } from 'helpers/json-api';

Cypress.Commands.add('routeForms', (mutator = _.identity) => {
  cy
    .fixture('collections/forms').as('fxForms');

  cy.route({
    url: '/api/forms',
    response() {
      return mutator({
        data: getResource(this.fxForms, 'forms', 5),
        included: [],
      });
    },
  })
    .as('routeForms');
});
