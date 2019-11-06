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

Cypress.Commands.add('routeClinicians', (mutator = _.identity, clinicians) => {
  cy
    .fixture('collections/clinicians').as('fxClinicians');

  cy.route({
    url: '/api/clinicians',
    response() {
      clinicians = clinicians || _.sample(this.fxClinicians, 9);

      return mutator({
        data: getResource(clinicians, 'clinicians'),
        included: [],
      });
    },
  })
    .as('routeClinicians');
});
