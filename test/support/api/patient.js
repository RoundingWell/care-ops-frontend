import _ from 'underscore';
import { getResource, getIncluded, getRelationship } from 'helpers/json-api';

Cypress.Commands.add('routePatient', (mutator = _.identity) => {
  cy
    .fixture('collections/patients').as('fxPatients')
    .fixture('collections/patient-fields').as('fxPatientFields')
    .fixture('collections/groups').as('fxGroups');

  cy.route({
    url: /api\/patients\/\d+?/,
    response() {
      const data = getResource(_.sample(this.fxPatients), 'patients');
      const groups = _.sample(this.fxGroups, 2);
      const fields = _.sample(this.fxPatientFields, 5);
      let included = [];

      included = getIncluded(included, groups, 'groups');
      included = getIncluded(included, fields, 'patient-fields');

      data.relationships = {
        groups: { data: getRelationship(groups, 'groups') },
        fields: { data: getRelationship(fields, 'patient-fields') },
      };

      return mutator({
        data,
        included,
      });
    },
  })
    .as('routePatient');
});
