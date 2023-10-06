import _ from 'underscore';
import { getResource, getRelationship } from 'helpers/json-api';

import fxActions from 'fixtures/collections/actions';
import fxPatients from 'fixtures/collections/patients';
import fxPrograms from 'fixtures/collections/programs';
import fxFlows from 'fixtures/collections/flows';

import fxTestClinicians from 'fixtures/test/clinicians';
import fxTestTeams from 'fixtures/test/teams';
import fxTestStates from 'fixtures/test/states';

function generateData(patients = _.sample(fxPatients, 5)) {
  const data = getResource(_.sample(fxActions, 20), 'patient-actions');
  const included = [];

  _.each(data, action => {
    action.relationships = {
      'patient': getRelationship(_.sample(patients), 'patients'),
      'program': getRelationship(_.sample(fxPrograms), 'program'),
      'state': getRelationship(_.sample(fxTestStates), 'states'),
      'form': getRelationship(),
      'form-responses': getRelationship(),
      'flow': getRelationship(),
    };

    if (_.random(1)) {
      action.relationships.owner = getRelationship(_.sample(fxTestClinicians), 'clinicians');
    } else {
      action.relationships.owner = getRelationship(_.sample(fxTestTeams), 'teams');
    }
  });

  included.push(...getResource(patients, 'patients'));

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
  const flow = _.defaults({ id: flowId }, _.sample(fxFlows));

  apiData.included.push(getResource(flow, 'flows'));

  _.each(data, action => {
    action.relationships.flow = getRelationship(flow, 'flows');
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

