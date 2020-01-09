import _ from 'underscore';
import { getResource, getIncluded, getRelationship } from 'helpers/json-api';

// NOTE: Uses includes for testing relationships
Cypress.Commands.add('routePatient', (mutator = _.identity) => {
  cy
    .fixture('collections/patients').as('fxPatients')
    .fixture('collections/patient-fields').as('fxPatientFields')
    .fixture('collections/groups').as('fxGroups');

  cy.route({
    url: '/api/patients/**?*',
    response() {
      const data = getResource(_.sample(this.fxPatients), 'patients');
      const groups = _.sample(this.fxGroups, 2);
      const fields = _.sample(this.fxPatientFields, 5);
      let included = [];

      included = getIncluded(included, groups, 'groups');
      included = getIncluded(included, fields, 'patient-fields');

      data.relationships = {
        'groups': { data: getRelationship(groups, 'groups') },
        'patient-fields': { data: getRelationship(fields, 'patient-fields') },
      };

      return mutator({
        data,
        included,
      });
    },
  })
    .as('routePatient');

  cy.routePatientFields();
});

Cypress.Commands.add('routePatients', (mutator = _.identity) => {
  cy
    .fixture('collections/patients').as('fxPatients')
    .fixture('collections/groups').as('fxGroups');

  cy.route({
    url: '/api/patients?*',
    response() {
      const data = getResource(_.sample(this.fxPatients, 30), 'patients');
      const groups = _.sample(this.fxGroups, 5);

      let included = [];

      included = getIncluded(included, groups, 'groups');

      _.each(data, patient => {
        patient.relationships = {
          groups: { data: getRelationship(_.sample(groups, _.random(1, 3)), 'groups') },
        };
      });

      return mutator({
        data,
        included,
      });
    },
  })
    .as('routePatients');
});

Cypress.Commands.add('routePatientByFlow', (mutator = _.identity) => {
  cy
    .fixture('collections/patients').as('fxPatients');

  cy.route({
    url: '/api/flows/**/patient',
    response() {
      return mutator({
        data: getResource(_.sample(this.fxPatients), 'patients'),
        included: [],
      });
    },
  })
    .as('routePatientByFlow');
});
