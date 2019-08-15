import _ from 'underscore';
import { getResource } from 'helpers/json-api';

Cypress.Commands.add('routeCurrentClinician', (mutator = _.identity) => {
  cy
    .fixture('test/clinicians').as('fxTestClinicians');

  cy.route({
    url: '/api/clinicians/me',
    response() {
      return mutator({
        data: getResource(this.fxTestClinicians[0], 'clinicians'),
        included: [],
      });
    },
  })
    .as('routeCurrentClinician');
});
