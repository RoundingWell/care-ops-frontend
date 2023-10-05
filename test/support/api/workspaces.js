import _ from 'underscore';
import { getResource, getRelationship } from 'helpers/json-api';

import fxTestWorkspaces from 'fixtures/test/workspaces.json';
import fxTestClinicians from 'fixtures/test/clinicians.json';
import fxTestForms from 'fixtures/test/forms.json';
import fxTestStates from 'fixtures/test/states.json';


Cypress.Commands.add('routeWorkspaces', (mutator = _.identity) => {
  const data = getResource(fxTestWorkspaces, 'workspaces');

  _.each(data, workspace => {
    workspace.relationships = {
      clinicians: getRelationship(fxTestClinicians, 'clinicians'),
      forms: getRelationship(fxTestForms, 'forms'),
      states: getRelationship(fxTestStates, 'states'),
    };
  });

  cy.intercept('GET', '/api/workspaces', {
    body: mutator({
      data,
      included: [],
    }),
  })
    .as('routeWorkspaces');
});
