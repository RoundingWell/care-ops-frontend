import _ from 'underscore';
import dayjs from 'dayjs';
import { getResource, getRelationship, mergeJsonApi } from 'helpers/json-api';

import fxTestFormResponse from 'fixtures/test/form-response';
import fxTestFormKitchenSink from 'fixtures/test/form-kitchen-sink';

import { getCurrentClinician } from 'support/api/clinicians';

import { FORM_RESPONSE_STATUS } from 'js/static';

const TYPE = 'form-responses';

export function getFormResponse(data) {
  const defaultRelationships = {
    editor: getRelationship(getCurrentClinician()),
    action: getRelationship(),
    patient: getRelationship(),
    form: getRelationship(),
  };

  const resource = getResource({
    id: '11111',
    created_at: dayjs.utc().format(),
    updated_at: dayjs.utc().format(),
    response: fxTestFormResponse,
    status: FORM_RESPONSE_STATUS.SUBMITTED,
  }, TYPE, defaultRelationships);

  return mergeJsonApi(resource, data, { VALID: { relationships: _.keys(defaultRelationships) } });
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

export {
  fxTestFormKitchenSink,
};
