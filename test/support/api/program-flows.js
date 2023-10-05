import _ from 'underscore';
import { getResource, getRelationship } from 'helpers/json-api';

import fxProgramFlows from 'fixtures/collections/program-flows';
import fxProgramActions from 'fixtures/collections/program-actions';
import fxPrograms from 'fixtures/collections/programs';

import fxTestTeams from 'fixtures/test/teams';

function getProgramFlowRelationships({ program, programActions, owner }) {
  return {
    'program': getRelationship(program, 'programs'),
    'program-actions': getRelationship(programActions, 'program-actions'),
    'owner': getRelationship(owner, 'teams'),
  };
}

Cypress.Commands.add('routeProgramFlow', (mutator = _.identity) => {
  const data = getResource(_.sample(fxProgramFlows), 'program-flows');

  data.relationships = getProgramFlowRelationships({
    program: _.sample(fxPrograms),
    programActions: _.sample(fxProgramActions, 10),
  });

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
  const program = _.defaults({ id: programId }, _.sample(fxPrograms));

  _.each(data, flow => {
    flow.relationships = getProgramFlowRelationships({
      program,
      programActions: _.sample(fxProgramActions, 10),
      owner: _.random(1) ? _.sample(fxTestTeams) : null,
    });
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
  const program = _.defaults({ id: programId }, _.sample(fxPrograms));

  _.each(data, (flow, index) => {
    flow.relationships = getProgramFlowRelationships({
      program,
      programActions: programFlowActions[index],
      owner: _.random(1) ? _.sample(fxTestTeams) : null,
    });
  });

  cy.intercept('GET', '/api/program-flows?*', {
    body: mutator({
      data,
      included: [],
    }),
  })
    .as('routeAllProgramFlows');
});

