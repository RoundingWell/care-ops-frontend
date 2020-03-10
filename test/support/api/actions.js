import _ from 'underscore';
import { getResource, getIncluded, getRelationship } from 'helpers/json-api';

function actionFixtures() {
  cy
    .fixture('collections/actions').as('fxActions')
    .fixture('collections/clinicians').as('fxClinicians')
    .fixture('collections/patients').as('fxPatients')
    .fixture('collections/programs').as('fxPrograms')
    .fixture('test/roles').as('fxRoles')
    .fixture('test/states').as('fxStates');
}

function generateData(patients = _.sample(this.fxPatients, 1)) {
  const data = getResource(_.sample(this.fxActions, 20), 'patient-actions');
  let included = [];

  _.each(data, action => {
    const patient = _.sample(patients);

    included = getIncluded(included, patient, 'patients');

    action.relationships = {
      'patient': { data: getRelationship(patient, 'patients') },
      'program': { data: getRelationship(_.sample(this.fxPrograms), 'program') },
      'state': { data: getRelationship(_.sample(this.fxStates), 'states') },
      'owner': { data: null },
      'form': { data: null },
      'form-responses': { data: null },
      'flow': { data: null },
    };

    if (_.random(1)) {
      const clinician = _.sample(this.fxClinicians);

      // NOTE: Uses includes for testing relationships
      included = getIncluded(included, clinician, 'clinicians');

      action.relationships.owner = {
        data: getRelationship(clinician, 'clinicians'),
      };
    } else {
      action.relationships.owner = {
        data: getRelationship(_.sample(this.fxRoles), 'roles'),
      };
    }
  });

  return {
    data,
    included,
  };
}

Cypress.Commands.add('routeAction', (mutator = _.identity) => {
  actionFixtures();

  cy.route({
    url: '/api/actions/*',
    response() {
      const apiData = generateData.call(this);
      apiData.data = _.sample(apiData.data);
      return mutator(apiData);
    },
  })
    .as('routeAction');

  cy.routeProgramByAction();
});

Cypress.Commands.add('routePatientActions', (mutator = _.identity, patientId = '1') => {
  actionFixtures();

  cy.route({
    url: '/api/patients/**/relationships/actions*',
    response() {
      const patient = _.sample(this.fxPatients);
      patient.id = patientId;
      return mutator(
        generateData.call(this, [patient]),
      );
    },
  })
    .as('routePatientActions');
});

Cypress.Commands.add('routeFlowActions', (mutator = _.identity, flowId = '1') => {
  actionFixtures();

  cy
    .fixture('collections/flows').as('fxFlows');

  cy.route({
    url: '/api/flows/**/relationships/actions',
    response() {
      const apiData = generateData.call(this);
      const data = apiData.data;
      const flow = _.sample(this.fxFlows);
      flow.id = flowId;

      apiData.included = getIncluded(apiData.included, flow, 'flows');

      _.each(data, action => {
        action.relationships.flow = {
          data: getRelationship(flow, 'flows'),
        };
      });

      return mutator(apiData);
    },
  })
    .as('routeFlowActions');
});

Cypress.Commands.add('routeActions', (mutator = _.identity) => {
  actionFixtures();

  cy.route({
    url: '/api/actions?*',
    response() {
      return mutator(generateData.call(this, _.sample(this.fxPatients, 5)));
    },
  })
    .as('routeActions');
});

