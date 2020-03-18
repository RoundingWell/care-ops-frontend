import _ from 'underscore';
import { getResource, getIncluded, getRelationship } from 'helpers/json-api';

function patientFixtures() {
  cy
    .fixture('collections/patients').as('fxPatients')
    .fixture('collections/actions').as('fxActions')
    .fixture('collections/patient-fields').as('fxPatientFields')
    .fixture('collections/groups').as('fxGroups');
}

function generatePatientData() {
  const data = getResource(_.sample(this.fxPatients), 'patients');
  const action = _.sample(this.fxActions, 10);
  const groups = _.sample(this.fxGroups, 2);
  const fields = _.sample(this.fxPatientFields, 5);

  data.relationships = {
    'actions': { data: getRelationship(action, 'patient-actions') },
    'groups': { data: getRelationship(groups, 'groups') },
    'patient-fields': { data: getRelationship(fields, 'patient-fields') },
  };

  let included = [];

  // NOTE: Uses includes for testing relationships
  included = getIncluded(included, groups, 'groups');
  included = getIncluded(included, fields, 'patient-fields');

  return {
    data,
    included,
  };
}

Cypress.Commands.add('routePatient', (mutator = _.identity) => {
  patientFixtures();

  cy.route({
    url: '/api/patients/**?*',
    response() {
      return mutator(generatePatientData.call(this));
    },
  })
    .as('routePatient');

  cy.routePatientFields();
});

Cypress.Commands.add('routePatientByAction', (mutator = _.identity) => {
  patientFixtures();

  cy.route({
    url: '/api/actions/**/patient',
    response() {
      return mutator(generatePatientData.call(this));
    },
  })
    .as('routePatientByAction');
});

Cypress.Commands.add('routePatientSearch', (mutator = _.identity) => {
  cy
    .fixture('collections/patients').as('fxPatients');

  cy.route({
    url: /api\/patients\?filter\[search\]/,
    response() {
      const patients = _.sample(this.fxPatients, 10);

      _.each(patients, (patient, index) => {
        patient.id = `${ index + 1 }`;
      });

      const data = getResource(_.clone(patients), 'patient-search-results');

      _.map(data, (result, index) => {
        result.id = `${ index + 1 }`;
        result.attributes = _.pick(result.attributes, 'first_name', 'last_name', 'birth_date');
        result.relationships = {
          'patient': {
            data: getRelationship(patients[index], 'patients'),
          },
        };
      });

      return mutator({
        data,
        included: getIncluded([], patients, 'patients'),
      });
    },
  })
    .as('routePatientSearch');
});
