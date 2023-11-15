import _ from 'underscore';
import dayjs from 'dayjs';
import { getResource } from 'helpers/json-api';

import fxTestFormResponse from 'fixtures/test/form-response';

const TYPE = 'form-responses';

export function getFormResponse() {
  return getResource({
    id: '11111',
    created_at: dayjs.utc().format(),
    response: fxTestFormResponse,
    status: 'submitted',
  }, TYPE);
}

Cypress.Commands.add('routeFormResponse', (mutator = _.identity) => {
  const data = getFormResponse();

  cy
    .intercept('GET', '/api/form-responses/*', {
      body: mutator({ data, included: [] }),
    })
    .as('routeFormResponse');
});

Cypress.Commands.add('routeLatestFormSubmission', (mutator = _.identity) => {
  const data = getFormResponse();

  const urlRegex = /^\/api\/form-responses\/latest\?(?=.*filter\[status\]=submitted).*$/;

  cy
    .intercept('GET', urlRegex, {
      body: mutator({ data, included: [] }),
    })
    .as('routeLatestFormSubmission');
});

Cypress.Commands.add('routeLatestFormResponse', (mutator = _.identity) => {
  const urlRegex = /^\/api\/form-responses\/latest\?(?=.*filter\[status\]=draft).*$/;
  const body = mutator();

  cy
    .intercept('GET', urlRegex, {
      statusCode: body ? 200 : 204,
      body,
    })
    .as('routeLatestFormResponse');
});
