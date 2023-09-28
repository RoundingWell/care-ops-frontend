import _ from 'underscore';
import { getResource, getIncluded, getRelationship } from 'helpers/json-api';

import fxFlows from 'fixtures/collections/flows';
import fxActions from 'fixtures/collections/actions';
import fxPatients from 'fixtures/collections/patients';
import fxPrograms from 'fixtures/collections/programs';
import fxProgramFlows from 'fixtures/collections/program-flows';
import fxProgramActions from 'fixtures/collections/program-actions';

import fxTestClincians from 'fixtures/test/clinicians';
import fxTestTeams from 'fixtures/test/teams';
import fxTestStates from 'fixtures/test/states';

function generateData(patients = _.sample(fxPatients, 5)) {
  const data = getResource(_.sample(fxFlows, 10), 'flows');
  const programFlows = _.sample(fxProgramFlows, 5);
  const programActionsSample = _.sample(fxProgramActions, 20);
  const programs = _.sample(fxPrograms, 1);
  let included = [];

  included = getIncluded(included, patients, 'patients');
  included = getIncluded(included, programFlows, 'program-flows');
  included = getIncluded(included, programs, 'programs');
  included = getIncluded(included, programActionsSample, 'program-actions');

  _.each(data, flow => {
    const patient = _.sample(patients);
    const programFlow = _.sample(programFlows);
    const programActions = _.sample(programActionsSample, 10);
    const program = _.sample(programs);
    programFlow.relationships = {};
    programFlow.relationships.program = { data: { id: program.id } };
    programFlow.relationships['program-actions'] = { data: getRelationship(programActions, 'program-actions') };

    flow.relationships = {
      'program-flow': { data: getRelationship(programFlow, 'program-flows') },
      'patient': { data: getRelationship(patient, 'patients') },
      'actions': { data: getRelationship(_.sample(fxActions, 10), 'patient-actions') },
      'state': { data: getRelationship(_.sample(fxTestStates), 'states') },
      'owner': { data: null },
    };

    flow.meta = {
      progress: { complete: 0, total: 5 },
    };

    if (_.random(1)) {
      const clinician = _.sample(_.rest(fxTestClincians));

      flow.relationships.owner = {
        data: getRelationship(clinician, 'clinicians'),
      };
    } else {
      flow.relationships.owner = {
        data: getRelationship(_.sample(fxTestTeams), 'teams'),
      };
    }
  });

  return {
    data,
    included,
  };
}

Cypress.Commands.add('routeFlow', (mutator = _.identity) => {
  const apiData = generateData();
  apiData.data = _.sample(apiData.data);

  cy.intercept('GET', '/api/flows/*', {
    body: mutator(apiData),
  })
    .as('routeFlow');
});

Cypress.Commands.add('routePatientFlows', (mutator = _.identity) => {
  cy.intercept('GET', '/api/patients/**/relationships/flows*', {
    body: mutator(generateData()),
  })
    .as('routePatientFlows');
});


Cypress.Commands.add('routeFlows', (mutator = _.identity) => {
  const apiData = mutator(generateData());

  if (!apiData.meta) apiData.meta = { flows: { total: apiData.data.length } };

  cy.intercept('GET', '/api/flows?*', {
    body: apiData,
  })
    .as('routeFlows');
});
