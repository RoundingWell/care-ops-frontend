import _ from 'underscore';
import { getResource, getRelationship } from 'helpers/json-api';

function makeResources(workspaces, clinicians, fxPatients, fxTeams) {
  clinicians = getResource(clinicians, 'clinicians');
  workspaces = getResource(workspaces, 'workspaces');

  _.each(clinicians, (clinician, i) => {
    if (clinician.relationships.team || clinician.id === '11111') return;
    clinician.relationships.workspaces = { data: [] };
    const teamIndex = (i >= fxTeams.length) ? i - fxTeams.length : i;
    const team = getRelationship(fxTeams[teamIndex], 'teams');
    clinician.relationships.team = { data: team };
    clinician.relationships.role = { data: { id: '11111', type: 'roles' } };
  });

  mutateWorkspace(workspaces[0], clinicians, fxPatients);

  if (workspaces[1]) {
    mutateWorkspace(workspaces[1], _.first(clinicians, 5), fxPatients);
  }

  if (workspaces[2]) {
    mutateWorkspace(workspaces[2], _.last(clinicians, 5), fxPatients);
  }

  return { workspacesData: workspaces, cliniciansData: clinicians };
}

function mutateWorkspace(workspace, clinicians, fxPatients) {
  const workspaceRelation = getRelationship(workspace, 'workspaces');
  workspace.relationships = getWorkspaceRelations(clinicians, fxPatients);
  _.each(clinicians, clinician => {
    if (clinician.id === '11111') return;
    clinician.relationships.workspaces.data.push(workspaceRelation);
  });
}

function getWorkspaceRelations(clinicians, fxPatients) {
  return {
    patients: { data: getRelationship(_.sample(fxPatients, 2), 'patients') },
    clinicians: { data: getRelationship(clinicians, 'clinicians') },
  };
}

Cypress.Commands.add('routeWorkspaces', (mutator = _.identity) => {
  cy
    .fixture('collections/workspaces').as('fxWorkspaces');

  cy.route({
    url: '/api/workspaces',
    response() {
      return mutator({
        data: getResource(_.sample(this.fxWorkspaces, 4), 'workspaces'),
        included: [],
      });
    },
  })
    .as('routeWorkspaces');
});

Cypress.Commands.add('routeWorkspacesBootstrap', (workspacesMutator = _.identity, workspaces, cliniciansMutator = _.identity) => {
  cy
    .fixture('test/clinicians').as('fxTestClinicians')
    .fixture('collections/clinicians').as('fxClinicians')
    .fixture('collections/workspaces').as('fxWorkspaces')
    .fixture('collections/patients').as('fxPatients')
    .fixture('test/teams').as('fxTeams');

  cy
    .wrap(null)
    .then(function() {
      // Get an odd number of clinicians for workspace assignment.
      // The active clinician is the "halfway" one, so number 4 here
      const fxPatients = this.fxPatients;
      const clinicians = _.sample(this.fxClinicians, 9);
      clinicians[4] = { id: '11111' };
      workspaces = workspaces || _.sample(this.fxWorkspaces, 4);

      const { workspacesData, cliniciansData } = makeResources(workspaces, clinicians, fxPatients, this.fxTeams);

      cy.routeWorkspaces(fx => {
        fx.data = workspacesData;

        return workspacesMutator(fx);
      });

      cy.routeClinicians(fx => {
        fx.data = cliniciansData;

        return cliniciansMutator(fx);
      });
    });
});
