import _ from 'underscore';
import { getResource, getIncluded, getRelationship } from 'helpers/json-api';

Cypress.Commands.add('routeOrganization', (mutator = _.identity) => {
  cy
    .fixture('collections/organizations').as('fxOrganizations')
    .fixture('collections/clinicians').as('fxClinicians')
    .fixture('collections/groups').as('fxGroups')
    .fixture('test/roles').as('fxRoles')
    .fixture('test/states').as('fxStates');

  cy.route({
    url: /api\/organizations\/\d+?/,
    response() {
      const data = getResource(_.sample(this.fxOrganizations), 'organization');
      let included = [];

      included = getIncluded(included, this.fxRoles, 'roles');
      included = getIncluded(included, this.fxStates, 'states');
      included = getIncluded(included, this.fxGroups, 'groups');
      included = getIncluded(included, this.fxClinicians, 'clinicians');

      data.relationships = {
        groups: { data: getRelationship(this.fxGroups, 'groups') },
        clinicians: { data: getRelationship(this.fxFlinicians, 'clinicians') },
        roles: { data: getRelationship(this.fxRoles, 'roles') },
        states: { data: getRelationship(this.fxStates, 'states') },
      };

      return mutator({
        data,
        included,
      });
    },
  })
    .as('routeOrganization');
});
