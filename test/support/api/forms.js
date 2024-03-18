import _ from 'underscore';

import { getResource } from 'helpers/json-api';

import fxTestForms from 'fixtures/test/forms';

const TYPE = 'forms';

export function getForm() {
  return getResource(_.sample(fxTestForms), TYPE);
}

export function getForms() {
  return getResource(fxTestForms, TYPE);
}

// Exporting only teams needed for testing variance
export const testForm = _.find(fxTestForms, { id: '11111' });

Cypress.Commands.add('routeForms', (mutator = _.identity) => {
  // form.options is no longer included in the '/api/forms' api request
  const fxForms = _.map(fxTestForms, form => {
    form = _.clone(form);
    form.options = {};
    return form;
  });

  cy
    .intercept('GET', '/api/forms', {
      body: mutator({
        data: getResource(fxForms, TYPE),
        included: [],
      }),
    })
    .as('routeForms');
});

Cypress.Commands.add('routeForm', (mutator = _.identity, formId = '11111') => {
  cy
    .intercept('GET', '/api/forms/*', {
      body: {
        data: getResource(_.find(fxTestForms, { id: formId }), TYPE),
        included: [],
      },
    })
    .as('routeForm');
});

Cypress.Commands.add('routeFormByAction', (mutator = _.identity, formId = '11111') => {
  cy
    .intercept('GET', '/api/actions/*/form', {
      body: mutator({
        data: getResource(_.find(fxTestForms, { id: formId }), TYPE),
        included: [],
      }),
    })
    .as('routeFormByAction');
});
