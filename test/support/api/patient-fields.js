import _ from 'underscore';
import { getResource } from 'helpers/json-api';

Cypress.Commands.add('routePatientField', (mutator = _.identity, fieldName) => {
  cy
    .fixture('collections/patient-fields').as('fxPatientFields');

  const alias = fieldName ? `routePatientField${ fieldName }` : 'routePatientField';

  cy.route({
    url: `/api/patients/**/fields/${ fieldName || '**' }`,
    response() {
      const data = getResource(_.sample(this.fxPatientFields), 'patient-fields');

      return mutator({
        data,
        included: [],
      });
    },
  })
    .as(alias);
});
