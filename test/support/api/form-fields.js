import _ from 'underscore';

import { getResource } from 'helpers/json-api';

import fxTestFormFields from 'fixtures/test/form-fields';

const TYPE = 'form-fields';

export function getFormField() {
  return getResource(_.sample(fxTestFormFields), TYPE);
}

Cypress.Commands.add('routeFormFields', (mutator = _.identity) => {
  const data = getFormField();

  cy
    .intercept('GET', '/api/forms/**/fields*', {
      body: mutator({ data, included: [] }),
    })
    .as('routeFormFields');
});

Cypress.Commands.add('routeFormActionFields', (mutator = _.identity) => {
  const data = getFormField();

  cy
    .intercept('GET', '/api/actions/**/form/fields*', {
      body: mutator({ data, included: [] }),
    })
    .as('routeFormActionFields');
});
