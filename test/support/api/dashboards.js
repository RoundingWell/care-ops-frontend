import _ from 'underscore';

import { getResource, mergeJsonApi } from 'helpers/json-api';

import fxTestDashboards from 'fixtures/collections/dashboards';

const TYPE = 'dashboards';

export function getDashboard(data) {
  const resource = getResource(_.sample(fxTestDashboards), TYPE);

  return mergeJsonApi(resource, data);
}

export function getDashboards({ attributes } = {}, { sample = 3 } = {}) {
  return _.times(sample, () => getDashboard({ attributes }));
}

Cypress.Commands.add('routeDashboards', (mutator = _.identity) => {
  const data = getDashboards();

  cy
    .intercept('GET', '/api/dashboards', {
      body: mutator({ data, included: [] }),
    })
    .as('routeDashboards');
});

Cypress.Commands.add('routeDashboard', (mutator = _.identity) => {
  const data = getDashboard();

  cy
    .intercept('GET', '/api/dashboards/*', {
      body: mutator({ data, included: [] }),
    })
    .as('routeDashboard');
});
