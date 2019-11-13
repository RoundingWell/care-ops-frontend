import _ from 'underscore';
import { getResource } from 'helpers/json-api';

Cypress.Commands.add('routeForms', (mutator = _.identity) => {
  cy
    .fixture('collections/forms').as('fxForms');

  cy.route({
    url: '/api/forms',
    response() {
      return mutator({
        data: getResource(_.sample(this.fxForms, 5), 'forms'),
        included: [],
      });
    },
  })
    .as('routeForms');
});
