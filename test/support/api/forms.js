import _ from 'underscore';
import { v4 as uuid } from 'uuid';
import { getResource, mergeJsonApi } from 'helpers/json-api';

import fxTestForms from 'fixtures/test/forms';

const TYPE = 'forms';

export function getForm(data) {
  const resource = getResource(_.sample(fxTestForms), TYPE);

  data = _.extend({ id: uuid() }, data);

  return mergeJsonApi(resource, data);
}

export function getForms() {
  return getResource(fxTestForms, TYPE);
}

// Exporting only form needed for testing variance
export const testForm = getResource(_.find(fxTestForms, { id: '11111' }));
export const testReadOnlyForm = getResource(_.find(fxTestForms, { id: '22222' }));
export const testWidgetsForm = getResource(_.find(fxTestForms, { id: '55555' }));
export const testPrefillForm = getResource(_.find(fxTestForms, { id: '66666' }));
export const testSubmitHiddenForm = getResource(_.find(fxTestForms, { id: '88888' }));
export const testReportForm = getResource(_.find(fxTestForms, { id: 'BBBBB' }));

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
