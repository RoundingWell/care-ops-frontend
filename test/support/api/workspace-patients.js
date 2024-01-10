import _ from 'underscore';
import { getResource } from 'helpers/json-api';

import fxWorkspacePatients from 'fixtures/collections/workspace-patients';

const TYPE = 'workspace-patients';

export function getWorkspacePatient() {
  return getResource(_.sample(fxWorkspacePatients), TYPE);
}

Cypress.Commands.add('routeWorkspacePatient', (mutator = _.identity) => {
  const data = getWorkspacePatient();

  cy
    .intercept('GET', '/api/workspace-patients/*', {
      body: mutator({ data, included: [] }),
    })
    .as('routeTags');
});
