import _ from 'underscore';
import { getResource, getIncluded, getRelationship } from 'helpers/json-api';

Cypress.Commands.add('routeCurrentClinician', (mutator = _.identity) => {
  cy
    .fixture('test/clinicians').as('fxTestClinicians');

  cy.route({
    url: '/api/clinicians/me',
    response() {
      return mutator({
        data: getResource(this.fxTestClinicians[0], 'clinicians'),
        included: [],
      });
    },
  })
    .as('routeCurrentClinician');
});

Cypress.Commands.add('routeClinicians', (mutator = _.identity, clinicians) => {
  cy
    .fixture('collections/clinicians').as('fxClinicians')
    .fixture('collections/groups').as('fxGroups')
    .fixture('test/roles').as('fxRoles');

  cy.route({
    url: '/api/clinicians',
    response() {
      const groups = _.sample(this.fxGroups, 2);
      clinicians = clinicians || _.sample(this.fxClinicians, 9);
      clinicians = getResource(clinicians, 'clinicians');

      _.each(clinicians, (clinician, i) => {
        if (clinician.relationships.role || clinician.id === '11111') return;
        const roleIndex = (i >= this.fxRoles.length) ? i - this.fxRoles.length : i;
        clinician.relationships.role = {
          data: getRelationship(this.fxRoles[roleIndex], 'roles'),
        };
        clinician.relationships.groups = {
          data: getRelationship(groups, 'groups'),
        };
      });

      const included = getIncluded(included, groups, 'groups');

      return mutator({
        data: clinicians,
        included,
      });
    },
  })
    .as('routeClinicians');
});
