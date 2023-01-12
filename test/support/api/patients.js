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
    'groups': { data: getRelationship(groups, 'workspaces') },
    'patient-fields': { data: getRelationship(fields, 'patient-fields') },
  };

  let included = [];

  // NOTE: Uses includes for testing relationships
  included = getIncluded(included, groups, 'workspaces');
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

  cy.routePatientField();
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

Cypress.Commands.add('routePatientByFlow', (mutator = _.identity) => {
  patientFixtures();

  cy.route({
    url: '/api/flows/**/patient',
    response() {
      return mutator(generatePatientData.call(this));
    },
  })
    .as('routePatientByFlow');
});

