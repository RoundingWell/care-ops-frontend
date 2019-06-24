import _ from 'underscore';
import { getResource, getIncluded, getRelationship } from 'helpers/json-api';


function getOrganization() {
  const organization = getResource(_.sample(this.fxOrganizations), 'organizations');

  organization.relationships = {
    roles: { data: getRelationship(this.fxRoles, 'roles') },
    states: { data: getRelationship(this.fxStates, 'states') },
  };

  return organization;
}

function getGroups(clinicians) {
  const first = _.first(clinicians, 5);
  const second = _.last(clinicians, 5);
  const groups = getResource(_.sample(this.fxGroups, 3), 'groups');

  groups[0].relationships = { clinicians: { data: getRelationship(first, 'clinicians') } };
  groups[1].relationships = { clinicians: { data: getRelationship(second, 'clinicians') } };
  groups[2].relationships = { clinicians: { data: getRelationship(clinicians, 'clinicians') } };

  return groups;
}

Cypress.Commands.add('routeCurrentClinician', (mutator = _.identity) => {
  cy
    .fixture('collections/organizations').as('fxOrganizations')
    .fixture('collections/clinicians').as('fxClinicians')
    .fixture('collections/groups').as('fxGroups')
    .fixture('test/states').as('fxStates')
    .fixture('test/roles').as('fxRoles');

  cy.route({
    url: /temporary/,
    response() {
      // Get an odd number of clinicians for group assignment.
      // The active clinician is the "halfway" one, so number 4 here
      const clinicians = getResource(_.sample(this.fxClinicians, 9), 'clinicians');
      const data = getResource(clinicians[4], 'clinicians');
      const groups = getGroups.call(this, clinicians);
      const organization = getOrganization.call(this, groups);
      let included = [];

      included = getIncluded(included, this.fxRoles, 'roles');
      included = getIncluded(included, this.fxStates, 'states');
      included = getIncluded(included, clinicians, 'clinicians');
      included = included.concat(organization);
      included = included.concat(groups);

      data.relationships = {
        groups: { data: getRelationship(groups, 'groups') },
        organization: { data: getRelationship(organization, 'organizations') },
        role: { data: getRelationship(_.sample(this.fxRoles), 'roles') },
      };

      return mutator({
        data,
        included,
      });
    },
  })
    .as('routeCurrentClinician');
});
