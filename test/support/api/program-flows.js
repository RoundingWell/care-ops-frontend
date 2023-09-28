import _ from 'underscore';
import { getResource, getRelationship } from 'helpers/json-api';

import fxProgramFlows from 'fixtures/collections/program-flows';
import fxProgramActions from 'fixtures/collections/program-actions';
import fxPrograms from 'fixtures/collections/programs';

import fxTestTeams from 'fixtures/test/teams';

Cypress.Commands.add('routeProgramFlow', (mutator = _.identity) => {
  const data = getResource(_.sample(fxProgramFlows), 'program-flows');
  const program = _.sample(fxPrograms);
  const flowActions = _.sample(fxProgramActions, 10);

  data.relationships = {
    'program': { data: getRelationship(program, 'programs') },
    'program-actions': { data: getRelationship(flowActions, 'program-actions') },
    'owner': { data: null },
  };

  cy.intercept('GET', '/api/program-flows/*', {
    body: mutator({
      data,
      included: [],
    }),
  })
    .as('routeProgramFlow');
});

Cypress.Commands.add('routeProgramFlows', (mutator = _.identity, programId) => {
  const data = getResource(_.sample(fxProgramFlows, 20), 'program-flows');
  const program = _.sample(fxPrograms);
  program.id = programId;

  _.each(data, flow => {
    flow.relationships = {
      program: { data: getRelationship(program, 'programs') },
      owner: { data: _.random(1) ? null : getRelationship(_.sample(fxTestTeams), 'teams') },
    };
  });

  cy.intercept('GET', '/api/programs/**/relationships/flows*', {
    body: mutator({
      data,
      included: [],
    }),
  })
    .as('routeProgramFlows');
});

Cypress.Commands.add('routeAllProgramFlows', (mutator = _.identity, programId) => {
  const data = getResource(_.sample(fxProgramFlows, 20), 'program-flows');
  const programFlowActions = getResource(_.sample(fxProgramActions, 10), 'program-actions');
  const program = _.sample(fxPrograms);
  program.id = programId;

  _.each(data, (flow, index) => {
    flow.relationships = {
      'program': { data: getRelationship(program, 'programs') },
      'program-actions': { data: getRelationship(programFlowActions[index], 'program-actions') },
      'owner': { data: _.random(1) ? null : getRelationship(_.sample(fxTestTeams), 'teams') },
    };
  });

  cy.intercept('GET', '/api/program-flows?*', {
    body: mutator({
      data,
      included: [],
    }),
  })
    .as('routeAllProgramFlows');
});

