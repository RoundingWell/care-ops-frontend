import _ from 'underscore';
import dayjs from 'dayjs';
import { getResource } from 'helpers/json-api';

import fxTestForms from 'fixtures/test/forms';
import fxTestFormResponse from 'fixtures/test/form-response';
import fxTestFormDefinition from 'fixtures/test/form-definition';
import fxTestFormFields from 'fixtures/test/form-fields';

Cypress.Commands.add('routeForms', (mutator = _.identity) => {
  // form.options is no longer included in the '/api/forms' api request
  const fxForms = _.map(fxTestForms, form => {
    form = _.clone(form);
    form.options = {};
    return form;
  });

  cy.intercept('GET', '/api/forms', {
    body: mutator({
      data: getResource(fxForms, 'forms'),
      included: [],
    }),
  })
    .as('routeForms');
});

Cypress.Commands.add('routeForm', (mutator = _.identity, formId = '11111') => {
  cy.intercept('GET', '/api/forms/*', {
    body: {
      data: getResource(_.find(fxTestForms, { id: formId }), 'forms'),
      included: [],
    },
  })
    .as('routeForm');
});

Cypress.Commands.add('routeFormByAction', (mutator = _.identity, formId = '11111') => {
  cy.intercept('GET', '/api/actions/*/form', {
    body: mutator({
      data: getResource(_.find(fxTestForms, { id: formId }), 'forms'),
      included: [],
    }),
  })
    .as('routeFormByAction');
});

Cypress.Commands.add('routeFormDefinition', (mutator = _.identity) => {
  cy.intercept('GET', '/api/forms/*/definition', {
    body: mutator(fxTestFormDefinition),
  })
    .as('routeFormDefinition');
});

Cypress.Commands.add('routeFormActionDefinition', (mutator = _.identity) => {
  cy.intercept('GET', '/api/actions/*/form/definition', {
    body: mutator(fxTestFormDefinition),
  })
    .as('routeFormActionDefinition');
});

Cypress.Commands.add('routeFormResponse', (mutator = _.identity) => {
  cy.intercept('GET', '/api/form-responses/*', {
    body: mutator({
      data: {
        id: '11111',
        type: 'form-responses',
        attributes: {
          created_at: dayjs.utc().format(),
          response: fxTestFormResponse,
          status: 'submitted',
        },
      },
    }),
  })
    .as('routeFormResponse');
});

Cypress.Commands.add('routeFormFields', (mutator = _.identity) => {
  cy.intercept('GET', '/api/forms/**/fields*', {
    body: mutator({
      data: getResource(_.sample(fxTestFormFields), 'form-fields'),
      included: [],
    }),
  })
    .as('routeFormFields');
});

Cypress.Commands.add('routeFormActionFields', (mutator = _.identity) => {
  cy.intercept('GET', '/api/actions/**/form/fields*', {
    body: mutator({
      data: getResource(_.sample(fxTestFormFields), 'form-fields'),
      included: [],
    }),
  })
    .as('routeFormActionFields');
});

Cypress.Commands.add('routeLatestFormSubmission', (mutator = _.identity) => {
  const urlRegex = /^\/api\/form-responses\/latest\?(?=.*filter\[status\]=submitted).*$/;

  cy.intercept('GET', urlRegex, {
    body: mutator({
      data: {
        id: '11111',
        type: 'form-responses',
        attributes: {
          created_at: dayjs.utc().format(),
          response: fxTestFormResponse,
          status: 'submitted',
        },
      },
    }),
  })
    .as('routeLatestFormSubmission');
});

Cypress.Commands.add('routeLatestFormResponse', (mutator = _.identity) => {
  const urlRegex = /^\/api\/form-responses\/latest\?(?=.*filter\[status\]=draft).*$/;
  const body = mutator();

  cy.intercept('GET', urlRegex, {
    statusCode: body ? 200 : 204,
    body,
  })
    .as('routeLatestFormResponse');
});
