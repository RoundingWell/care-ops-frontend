import _ from 'underscore';
import { getResource, getRelationship } from 'helpers/json-api';

import fxPatients from 'fixtures/collections/patients';
import fxActions from 'fixtures/collections/actions';
import fxPatientFields from 'fixtures/collections/patient-fields';

import fxTestWorkspaces from 'fixtures/test/workspaces';

function generatePatientData() {
  const data = getResource(_.sample(fxPatients), 'patients');
  const action = _.sample(fxActions, 10);
  const fields = _.sample(fxPatientFields, 5);

  data.relationships = {
    'actions': getRelationship(action, 'patient-actions'),
    'workspaces': getRelationship(fxTestWorkspaces, 'workspaces'),
    'patient-fields': getRelationship(fields, 'patient-fields'),
  };

  const included = [];

  // NOTE: Uses includes for testing relationships
  included.push(...getResource(fields, 'patient-fields'));

  return {
    data,
    included,
  };
}

Cypress.Commands.add('routePatient', (mutator = _.identity) => {
  cy.intercept('GET', '/api/patients/**?*', {
    body: mutator(generatePatientData()),
  })
    .as('routePatient');

  cy.routePatientField();
});

Cypress.Commands.add('routePatientByAction', (mutator = _.identity) => {
  cy.intercept('GET', '/api/actions/**/patient', {
    body: mutator(generatePatientData()),
  })
    .as('routePatientByAction');
});

Cypress.Commands.add('routePatientByFlow', (mutator = _.identity) => {
  cy.intercept('GET', '/api/flows/**/patient', {
    body: mutator(generatePatientData()),
  })
    .as('routePatientByFlow');
});

