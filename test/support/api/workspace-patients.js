import _ from 'underscore';
import { getResource, mergeJsonApi } from 'helpers/json-api';

import fxWorkspacePatients from 'fixtures/collections/workspace-patients';

const TYPE = 'workspace-patients';

export function getWorkspacePatient(data) {
  const resource = getResource(_.sample(fxWorkspacePatients), TYPE);

  return mergeJsonApi(resource, data);
}

Cypress.Commands.add('routeWorkspacePatient', (mutator = _.identity) => {
  const data = getWorkspacePatient();

  cy
    .intercept('GET', '/api/workspace-patients/*', {
      body: mutator({ data, included: [] }),
    })
    .as('routeWorkspacePatient');
});
