import _ from 'underscore';
import { getResource, getIncluded, getRelationship } from 'helpers/json-api';

function actionFixtures() {
  cy
    .fixture('collections/actions').as('fxActions')
    .fixture('test/clinicians').as('fxClinicians')
    .fixture('collections/patients').as('fxPatients')
    .fixture('collections/programs').as('fxPrograms')
    .fixture('test/teams').as('fxTeams')
    .fixture('test/states').as('fxStates');
}

function generateData(patients = _.sample(this.fxPatients, 5)) {
  const data = getResource(_.sample(this.fxActions, 20), 'patient-actions');
  let included = [];

  _.each(data, action => {
    const patient = _.sample(patients);

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

      action.relationships.owner = {
        data: getRelationship(clinician, 'clinicians'),
      };
    } else {
      action.relationships.owner = {
        data: getRelationship(_.sample(this.fxTeams), 'teams'),
      };
    }
  });

  included = getIncluded(included, patients, 'patients');

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
      apiData.data.relationships.state.data.id = '33333';
      return mutator(apiData);
    },
  })
    .as('routeAction');
});

Cypress.Commands.add('routePatientActions', (mutator = _.identity) => {
  actionFixtures();

  cy.route({
    url: '/api/patients/**/relationships/actions*',
    response() {
      return mutator(
        generateData.call(this),
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

