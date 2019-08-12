import _ from 'underscore';
import { getResource, getIncluded, getRelationship } from 'helpers/json-api';


function getOrganization() {
  const organization = getResource(_.sample(this.fxOrganizations), 'organizations');

  organization.relationships = {
    roles: { data: getRelationship(this.fxRoles, 'roles') },
    states: { data: getRelationship(this.fxStates, 'states') },
    groups: { data: getRelationship(_.sample(this.fxGroups), 'groups') },
  };

  return organization;
}

function getGroups(clinicians) {
  const groups = getResource(_.sample(this.fxGroups, 3), 'groups');

  groups[0].relationships = getGroup.call(this, _.first(clinicians, 5));
  groups[1].relationships = getGroup.call(this, _.last(clinicians, 5));
  groups[2].relationships = getGroup.call(this, clinicians);

  return groups;
}

function getGroup(clinicians) {
  return {
    organization: { data: getRelationship(_.sample(this.fxOrganizations), 'organizations') },
    patients: { data: getRelationship(_.sample(this.fxPatients, 2), 'patients') },
    clinicians: { data: getRelationship(clinicians, 'clinicians') },
  };
}

Cypress.Commands.add('routeCurrentClinician', (mutator = _.identity) => {
  cy
    .fixture('test/organizations').as('fxOrganizations')
    .fixture('collections/clinicians').as('fxClinicians')
    .fixture('test/clinicians').as('fxTestClinicians')
    .fixture('collections/groups').as('fxGroups')
    .fixture('collections/patients').as('fxPatients')
    .fixture('test/states').as('fxStates')
    .fixture('test/roles').as('fxRoles');

  cy.route({
    url: '/api/clinicians/me?*',
    response() {
      // Get an odd number of clinicians for group assignment.
      // The active clinician is the "halfway" one, so number 4 here
      const clinicians = getResource(_.sample(this.fxClinicians, 9), 'clinicians');
      clinicians[4] = getResource(this.fxTestClinicians[0], 'clinicians');
      const data = clinicians[4];
      const organization = getOrganization.call(this);
      const groups = getGroups.call(this, clinicians);

      data.relationships = {
        groups: { data: getRelationship(groups, 'groups') },
        role: { data: getRelationship(_.sample(this.fxRoles), 'roles') },
      };

      let included = [];

      included = getIncluded(included, this.fxRoles, 'roles');
      included = getIncluded(included, this.fxStates, 'states');
      included = included.concat(clinicians);
      included = included.concat(organization);
      included = included.concat(groups);

      return mutator({
        data,
        included,
      });
    },
  })
    .as('routeCurrentClinician');
});

Cypress.Commands.add('routeCurrentByGroup', (mutator = _.identity) => {
  cy.route({
    url: '/api/groups/**/relationships/clinicians',
    response() {
      return mutator({
        data: _.sample(this.fxClinicians, 3),
        included: [],
      });
    },
  });
});
