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
      let included = [];

      included = getIncluded(included, this.fxGroups, 'groups');
      included = getIncluded(included, this.fxPatientFields, 'patient-fields');

      data.relationships = {
        groups: { data: getRelationship(this.fxGroups, 'groups') },
        fields: { data: getRelationship(this.fxPatientFields, 'patient-fields') },
      };

      return mutator({
        data,
        included,
      });
    },
  })
    .as('routePatient');
});
