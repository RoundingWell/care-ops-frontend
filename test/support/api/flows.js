import _ from 'underscore';
import { getResource, getRelationship } from 'helpers/json-api';

import fxFlows from 'fixtures/collections/flows';
import fxActions from 'fixtures/collections/actions';
import fxPatients from 'fixtures/collections/patients';
import fxPrograms from 'fixtures/collections/programs';
import fxProgramFlows from 'fixtures/collections/program-flows';
import fxProgramActions from 'fixtures/collections/program-actions';

import fxTestClincians from 'fixtures/test/clinicians';
import fxTestTeams from 'fixtures/test/teams';
import fxTestStates from 'fixtures/test/states';

function getProgramFlows({ program, programFlows, programActions }) {
  return _.map(programFlows, fxProgramFlow => {
    const programFlow = getResource(fxProgramFlow, 'program-flows');
    programFlow.relationships = {
      'program': getRelationship(program, 'programs'),
      'program-actions': getRelationship(_.sample(programActions, 10), 'program-actions'),
    };
    return programFlow;
  });
}

function generateData(patients = _.sample(fxPatients, 5)) {
  const data = getResource(_.sample(fxFlows, 10), 'flows');
  const programs = _.sample(fxPrograms, 1);
  const programActions = _.sample(fxProgramActions, 20);
  const programFlows = getProgramFlows({
    programFlows: _.sample(fxProgramFlows, 5),
    programs: _.sample(programs),
    programActions,
  });

  const included = [...programFlows];

  included.push(...getResource(patients, 'patients'));
  included.push(...getResource(programs, 'programs'));
  included.push(...getResource(programActions, 'program-actions'));

  _.each(data, flow => {
    flow.relationships = {
      'program-flow': getRelationship(_.sample(programFlows), 'program-flows'),
      'patient': getRelationship(_.sample(patients), 'patients'),
      'actions': getRelationship(_.sample(fxActions, 10), 'patient-actions'),
      'state': getRelationship(_.sample(fxTestStates), 'states'),
    };

    if (_.random(1)) {
      flow.relationships.owner = getRelationship(_.sample(_.rest(fxTestClincians)), 'clinicians');
    } else {
      flow.relationships.owner = getRelationship(_.sample(fxTestTeams), 'teams');
    }

    flow.meta = {
      progress: { complete: 0, total: 5 },
    };
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
