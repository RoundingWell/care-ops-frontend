import _ from 'underscore';
import dayjs from 'dayjs';
import { getResource, getIncluded, getRelationship } from 'helpers/json-api';
import fxWorkspaces from 'fixtures/collections/workspaces.json';
import fxClinicians from 'fixtures/collections/clinicians.json';
import fxTestClinicians from 'fixtures/test/clinicians.json';
import fxTeams from 'fixtures/test/teams.json';
import fxRoles from 'fixtures/test/roles.json';

Cypress.Commands.add('routeCurrentClinician', (mutator = _.identity) => {
  cy.route({
    url: '/api/clinicians/me',
    response() {
      const clinician = getResource(_.find(fxTestClinicians, { id: '11111' }), 'clinicians');

      clinician.attributes.last_active_at = dayjs.utc().format();

      const workspaces = _.sample(fxWorkspaces, 2);
      workspaces[0].id = '11111';
      workspaces[1].id = '22222';

      clinician.relationships.workspaces = {
        data: getRelationship(workspaces, 'workspaces'),
      };

      clinician.relationships.team = {
        data: getRelationship(_.find(fxTeams, { id: '22222' }), 'teams'),
      };

      clinician.relationships.role = {
        data: getRelationship(_.find(fxRoles, { id: '11111' }), 'roles'),
      };

      return mutator({
        data: clinician,
        included: getIncluded([], workspaces, 'workspaces'),
      });
    },
  })
    .as('routeCurrentClinician');
});

Cypress.Commands.add('routeClinicians', (mutator = _.identity, clinicians) => {
  cy.route({
    url: '/api/clinicians',
    response() {
      let included = [];
      const workspaces = _.sample(fxWorkspaces, 2);
      clinicians = clinicians || _.sample(fxClinicians, 9);
      clinicians = getResource(clinicians, 'clinicians');

      _.each(clinicians, (clinician, i) => {
        if (clinician.relationships.team || clinician.id === '11111') return;
        const teamIndex = (i >= fxTeams.length) ? i - fxTeams.length : i;
        clinician.relationships.team = {
          data: getRelationship(fxTeams[teamIndex], 'teams'),
        };
        clinician.relationships.workspaces = {
          data: getRelationship(workspaces, 'workspaces'),
        };
        clinician.relationships.role = {
          data: getRelationship(_.sample(fxRoles), 'roles'),
        };
      });

      included = getIncluded(included, workspaces, 'workspaces');

      return mutator({
        data: clinicians,
        included,
      });
    },
  })
    .as('routeClinicians');
});

Cypress.Commands.add('routeClinician', (mutator = _.identity) => {
  cy.route({
    url: /\/api\/clinicians\/[^me]+/,
    response() {
      let included = [];
      const workspaces = _.sample(fxWorkspaces, 2);
      const clinician = getResource(_.sample(fxClinicians), 'clinicians');

      clinician.relationships.team = {
        data: getRelationship(_.sample(fxTeams), 'teams'),
      };

      clinician.relationships.workspaces = {
        data: getRelationship(workspaces, 'workspaces'),
      };

      clinician.relationships.role = {
        data: getRelationship(_.sample(fxRoles), 'roles'),
      };

      included = getIncluded(included, workspaces, 'workspaces');

      return mutator({
        data: clinician,
        included,
      });
    },
  })
    .as('routeClinician');
});
