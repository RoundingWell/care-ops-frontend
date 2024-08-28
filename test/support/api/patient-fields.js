import _ from 'underscore';
import { v4 as uuid } from 'uuid';
import { getResource, mergeJsonApi } from 'helpers/json-api';

import fxPatientFields from 'fixtures/collections/patient-fields';

const TYPE = 'patient-fields';

export function getPatientField(data) {
  const resource = getResource(_.sample(fxPatientFields), TYPE);

  data = _.extend({ id: uuid() }, data);

  return mergeJsonApi(resource, data);
}

export function getPatientFields({ attributes, relationships, meta } = {}, { sample = 3 } = {}) {
  return _.times(sample, () => getPatientField({ attributes, relationships, meta }));
}

Cypress.Commands.add('routePatientField', (mutator = _.identity, fieldName) => {
  const data = getPatientField();
  const alias = fieldName ? `routePatientField${ fieldName }` : 'routePatientField';

  cy
    .intercept('GET', `/api/patients/**/fields/${ fieldName || '**' }`, {
      body: mutator({ data, included: [] }),
    })
    .as(alias);
});
