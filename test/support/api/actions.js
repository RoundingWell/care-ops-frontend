import _ from 'underscore';
import { getResource, getIncluded, getRelationship } from 'helpers/json-api';

import fxActions from 'fixtures/collections/actions';
import fxPatients from 'fixtures/collections/patients';
import fxPrograms from 'fixtures/collections/programs';
import fxFlows from 'fixtures/collections/flows';

import fxTestClinicians from 'fixtures/test/clinicians';
import fxTestTeams from 'fixtures/test/teams';
import fxTestStates from 'fixtures/test/states';

function generateData(patients = _.sample(fxPatients, 5)) {
  const data = getResource(_.sample(fxActions, 20), 'patient-actions');
  let included = [];

  _.each(data, action => {
    const patient = _.sample(patients);

    action.relationships = {
      'patient': { data: getRelationship(patient, 'patients') },
      'program': { data: getRelationship(_.sample(fxPrograms), 'program') },
      'state': { data: getRelationship(_.sample(fxTestStates), 'states') },
      'owner': { data: null },
      'form': { data: null },
      'form-responses': { data: null },
      'flow': { data: null },
    };

    if (_.random(1)) {
      const clinician = _.sample(fxTestClinicians);

      action.relationships.owner = {
        data: getRelationship(clinician, 'clinicians'),
      };
    } else {
      action.relationships.owner = {
        data: getRelationship(_.sample(fxTestTeams), 'teams'),
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
  const apiData = generateData();
  apiData.data = _.sample(apiData.data);
  apiData.data.relationships.state.data.id = '33333';

  cy.intercept('GET', '/api/actions/*', {
    body: mutator(apiData),
  })
    .as('routeAction');
});

Cypress.Commands.add('routePatientActions', (mutator = _.identity) => {
  cy.intercept('GET', '/api/patients/**/relationships/actions*', {
    body: mutator(generateData()),
  })
    .as('routePatientActions');
});

Cypress.Commands.add('routeFlowActions', (mutator = _.identity, flowId = '1') => {
  const apiData = generateData();
  const data = apiData.data;
  const flow = _.sample(fxFlows);
  flow.id = flowId;

  apiData.included = getIncluded(apiData.included, flow, 'flows');

  _.each(data, action => {
    action.relationships.flow = {
      data: getRelationship(flow, 'flows'),
    };
  });

  cy.intercept('GET', '/api/flows/**/relationships/actions', {
    body: mutator(apiData),
  })
    .as('routeFlowActions');
});

Cypress.Commands.add('routeActions', (mutator = _.identity) => {
  const apiData = mutator(generateData());

  if (!apiData.meta) apiData.meta = { actions: { total: apiData.data.length } };

  cy.intercept('GET', '/api/actions?*', {
    body: apiData,
  })
    .as('routeActions');
});

