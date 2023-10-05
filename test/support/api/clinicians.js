import _ from 'underscore';
import dayjs from 'dayjs';
import { getResource, getRelationship } from 'helpers/json-api';

import fxTestWorkspaces from 'fixtures/test/workspaces.json';
import fxTestClinicians from 'fixtures/test/clinicians.json';
import fxTestTeams from 'fixtures/test/teams.json';
import fxTestRoles from 'fixtures/test/roles.json';

function getClinicianRelationships(clinician) {
  if (clinician.id === '11111') return clinician.relationships;

  return {
    team: {
      data: getRelationship(_.sample(fxTestTeams), 'teams'),
    },
    workspaces: {
      data: getRelationship(fxTestWorkspaces, 'workspaces'),
    },
    role: {
      data: getRelationship(_.find(fxTestRoles, { id: '11111' }), 'roles'),
    },
  };
}

Cypress.Commands.add('routeCurrentClinician', (mutator = _.identity) => {
  const clinician = getResource(_.find(fxTestClinicians, { id: '11111' }), 'clinicians');

  clinician.attributes.last_active_at = dayjs.utc().format();

  clinician.relationships.workspaces = {
    data: getRelationship(fxTestWorkspaces, 'workspaces'),
  };

  clinician.relationships.team = {
    data: getRelationship(_.find(fxTestTeams, { id: '22222' }), 'teams'),
  };

  clinician.relationships.role = {
    data: getRelationship(_.find(fxTestRoles, { id: '11111' }), 'roles'),
  };

  cy.intercept('GET', '/api/clinicians/me', {
    body: mutator({
      data: clinician,
      included: [],
    }),
  })
    .as('routeCurrentClinician');
});

Cypress.Commands.add('routeClinicians', (mutator = _.identity) => {
  // Remove current clinician
  const clinicians = getResource(_.rest(fxTestClinicians), 'clinicians');

  _.each(clinicians, clinician => {
    clinician.relationships = getClinicianRelationships(clinician);
  });

  cy.intercept('GET', '/api/clinicians', {
    body: mutator({
      data: clinicians,
      included: [],
    }),
  })
    .as('routeClinicians');
});

Cypress.Commands.add('routeWorkspaceClinicians', (mutator = _.identity) => {
  const clinicians = getResource(fxTestClinicians, 'clinicians');

  _.each(clinicians, clinician => {
    clinician.relationships = getClinicianRelationships(clinician);
  });

  cy.intercept('GET', '/api/workspaces/**/relationships/clinicians*', {
    body: mutator({
      data: clinicians,
      included: [],
    }),
  })
    .as('routeWorkspaceClinicians');
});

Cypress.Commands.add('routeClinician', (mutator = _.identity) => {
  const clinician = getResource(_.sample(fxTestClinicians), 'clinicians');

  clinician.relationships = getClinicianRelationships(clinician);

  cy.intercept('GET', /\/api\/clinicians\/[^me]+/, {
    body: mutator({
      data: clinician,
      included: [],
    }),
  })
    .as('routeClinician');
});
