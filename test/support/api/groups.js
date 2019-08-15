import _ from 'underscore';
import { getResource, getRelationship } from 'helpers/json-api';

function getGroups(groups, clinicians) {
  groups = getResource(groups, 'groups');

  _.each(clinicians, clinician => {
    clinician.relationships.groups = { data: [] };
  });

  mutateGroup.call(this, groups[0], clinicians);

  if (groups[1]) {
    mutateGroup.call(this, groups[1], _.first(clinicians, 5));
  }

  if (groups[2]) {
    mutateGroup.call(this, groups[2], _.last(clinicians, 5));
  }

  return groups;
}

function mutateGroup(group, clinicians) {
  const groupRelation = getRelationship(group, 'groups');
  group.relationships = getGroupRelations.call(this, clinicians);
  _.each(clinicians, clinician => {
    clinician.relationships.groups.data.push(groupRelation);
  });
}

function getGroupRelations(clinicians) {
  return {
    patients: { data: getRelationship(_.sample(this.fxPatients, 2), 'patients') },
    clinicians: { data: getRelationship(clinicians, 'clinicians') },
  };
}

Cypress.Commands.add('routeGroups', (mutator = _.identity, groups) => {
  cy
    .fixture('test/clinicians').as('fxTestClinicians')
    .fixture('collections/clinicians').as('fxClinicians')
    .fixture('collections/groups').as('fxGroups')
    .fixture('collections/patients').as('fxPatients');

  cy.route({
    url: '/api/groups?*',
    response() {
      // Get an odd number of clinicians for group assignment.
      // The active clinician is the "halfway" one, so number 4 here
      const clinicians = getResource(_.sample(this.fxClinicians, 9), 'clinicians');
      clinicians[4] = getResource(this.fxTestClinicians[0], 'clinicians');
      groups = groups || _.sample(this.fxGroups, 4);

      return mutator({
        data: getGroups.call(this, groups, clinicians),
        included: clinicians,
      });
    },
  })
    .as('routeGroups');
});
