import _ from 'underscore';
import { getResource } from 'helpers/json-api';

Cypress.Commands.add('routePatientFields', (mutator = _.identity) => {
  cy
    .fixture('collections/patient-fields').as('fxPatientFields');

  cy.route({
    url: '/api/patients/**/fields',
    response() {
      const data = getResource(_.sample(this.fxPatientFields, 5), 'patient-fields');

      return mutator({
        data,
        included: [],
      });
    },
  })
    .as('routePatientFields');
});
