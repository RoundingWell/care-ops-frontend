import _ from 'underscore';
import { getResource, getRelationship } from 'helpers/json-api';

function makeResources(groups, clinicians, fxPatients, fxTeams) {
  clinicians = getResource(clinicians, 'clinicians');
  groups = getResource(groups, 'groups');

  _.each(clinicians, (clinician, i) => {
    clinician.relationships.groups = { data: [] };
    if (clinician.relationships.team || clinician.id === '11111') return;
    const teamIndex = (i >= fxTeams.length) ? i - fxTeams.length : i;
    const team = getRelationship(fxTeams[teamIndex], 'teams');
    clinician.relationships.team = { data: team };
  });

  mutateGroup(groups[0], clinicians, fxPatients);

  if (groups[1]) {
    mutateGroup(groups[1], _.first(clinicians, 5), fxPatients);
  }

  if (groups[2]) {
    mutateGroup(groups[2], _.last(clinicians, 5), fxPatients);
  }

  return { groupsData: groups, cliniciansData: clinicians };
}

function mutateGroup(group, clinicians, fxPatients) {
  const groupRelation = getRelationship(group, 'groups');
  group.relationships = getGroupRelations(clinicians, fxPatients);
  _.each(clinicians, clinician => {
    clinician.relationships.groups.data.push(groupRelation);
  });
}

function getGroupRelations(clinicians, fxPatients) {
  return {
    patients: { data: getRelationship(_.sample(fxPatients, 2), 'patients') },
    clinicians: { data: getRelationship(clinicians, 'clinicians') },
  };
}

Cypress.Commands.add('routeGroups', (mutator = _.identity) => {
  cy
    .fixture('collections/groups').as('fxGroups');

  cy.route({
    url: '/api/groups',
    response() {
      return mutator({
        data: getResource(_.sample(this.fxGroups, 4), 'groups'),
        included: [],
      });
    },
  })
    .as('routeGroups');
});

Cypress.Commands.add('routeGroupsBootstrap', (groupsMutator = _.identity, groups, cliniciansMutator = _.identity) => {
  cy
    .fixture('test/clinicians').as('fxTestClinicians')
    .fixture('collections/clinicians').as('fxClinicians')
    .fixture('collections/groups').as('fxGroups')
    .fixture('collections/patients').as('fxPatients')
    .fixture('test/teams').as('fxTeams');

  cy
    .wrap(null)
    .then(function() {
      // Get an odd number of clinicians for group assignment.
      // The active clinician is the "halfway" one, so number 4 here
      const fxPatients = this.fxPatients;
      const clinicians = _.sample(this.fxClinicians, 9);
      clinicians[4] = { id: '11111' };
      groups = groups || _.sample(this.fxGroups, 4);

      const { groupsData, cliniciansData } = makeResources(groups, clinicians, fxPatients, this.fxTeams);

      cy.routeGroups(fx => {
        fx.data = groupsData;

        return groupsMutator(fx);
      });

      cy.routeClinicians(fx => {
        fx.data = cliniciansData;

        return cliniciansMutator(fx);
      });
    });
});
