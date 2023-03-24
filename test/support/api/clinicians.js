import _ from 'underscore';
import dayjs from 'dayjs';
import { getResource, getRelationship } from 'helpers/json-api';
import fxWorkspaces from 'fixtures/test/workspaces.json';
import fxClinicians from 'fixtures/test/clinicians.json';
import fxTeams from 'fixtures/test/teams.json';
import fxRoles from 'fixtures/test/roles.json';

function getClinicianRelationships(clinician) {
  if (clinician.id === '11111') return clinician.relationships;

  return {
    team: {
      data: getRelationship(_.sample(fxTeams), 'teams'),
    },
    workspaces: {
      data: getRelationship(fxWorkspaces, 'workspaces'),
    },
    role: {
      data: getRelationship(_.sample(fxRoles), 'roles'),
    },
  };
}

Cypress.Commands.add('routeCurrentClinician', (mutator = _.identity) => {
  cy.route({
    url: '/api/clinicians/me',
    response() {
      const clinician = getResource(_.find(fxClinicians, { id: '11111' }), 'clinicians');

      clinician.attributes.last_active_at = dayjs.utc().format();

      clinician.relationships.workspaces = {
        data: getRelationship(fxWorkspaces, 'workspaces'),
      };

      clinician.relationships.team = {
        data: getRelationship(_.find(fxTeams, { id: '22222' }), 'teams'),
      };

      clinician.relationships.role = {
        data: getRelationship(_.find(fxRoles, { id: '11111' }), 'roles'),
      };

      return mutator({
        data: clinician,
        included: [],
      });
    },
  })
    .as('routeCurrentClinician');
});

Cypress.Commands.add('routeClinicians', (mutator = _.identity) => {
  cy.route({
    url: '/api/clinicians',
    response() {
      // Remove current clinician
      const clinicians = getResource(_.rest(fxClinicians), 'clinicians');

      _.each(clinicians, clinician => {
        clinician.relationships = getClinicianRelationships(clinician);
      });

      return mutator({
        data: clinicians,
        included: [],
      });
    },
  })
    .as('routeClinicians');
});

Cypress.Commands.add('routeWorkspaceClinicians', (mutator = _.identity) => {
  cy.route({
    url: '/api/workspaces/**/relationships/clinicians*',
    response() {
      const clinicians = getResource(fxClinicians, 'clinicians');

      _.each(clinicians, clinician => {
        clinician.relationships = getClinicianRelationships(clinician);
      });

      return mutator({
        data: clinicians,
        included: [],
      });
    },
  })
    .as('routeWorkspaceClinicians');
});

Cypress.Commands.add('routeClinician', (mutator = _.identity) => {
  cy.route({
    url: /\/api\/clinicians\/[^me]+/,
    response() {
      const clinician = getResource(_.sample(fxClinicians), 'clinicians');

      clinician.relationships = getClinicianRelationships(clinician);

      return mutator({
        data: clinician,
        included: [],
      });
    },
  })
    .as('routeClinician');
});
