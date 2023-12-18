import _ from 'underscore';

import { getResource, mergeJsonApi } from 'helpers/json-api';

import fxTestFormFields from 'fixtures/test/form-fields';

const TYPE = 'form-fields';

export function getFormFields(data) {
  const resource = getResource(fxTestFormFields, TYPE);

  return mergeJsonApi(resource, data);
}

Cypress.Commands.add('routeFormFields', (mutator = _.identity) => {
  const data = getFormFields();

  cy
    .intercept('GET', '/api/forms/**/fields*', {
      body: mutator({ data, included: [] }),
    })
    .as('routeFormFields');
});

Cypress.Commands.add('routeFormActionFields', (mutator = _.identity) => {
  cy
    .intercept('GET', '/api/actions/**/form/fields*', {
      body: mutator({ data: {}, included: [] }),
    })
    .as('routeFormActionFields');
});
