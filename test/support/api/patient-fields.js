import _ from 'underscore';
import { getResource } from 'helpers/json-api';

import fxPatientFields from 'fixtures/collections/patient-fields';

Cypress.Commands.add('routePatientField', (mutator = _.identity, fieldName) => {
  const alias = fieldName ? `routePatientField${ fieldName }` : 'routePatientField';

  cy.intercept('GET', `/api/patients/**/fields/${ fieldName || '**' }`, {
    body: mutator({
      data: getResource(_.sample(fxPatientFields), 'patient-fields'),
      included: [],
    }),
  })
    .as(alias);
});
