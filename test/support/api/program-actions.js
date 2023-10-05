import _ from 'underscore';
import { getResource, getRelationship } from 'helpers/json-api';

import fxProgramActions from 'fixtures/collections/program-actions';
import fxPrograms from 'fixtures/collections/programs';
import fxProgramFlows from 'fixtures/collections/program-flows';

import fxTestTeams from 'fixtures/test/teams';

function getProgramActionRelationships({ program, owner, form, programFlow }) {
  return {
    'form': getRelationship(form, 'forms'),
    'program': getRelationship(program, 'programs'),
    'program-flow': getRelationship(programFlow, 'program-flows'),
    'owner': getRelationship(owner, 'teams'),
  };
}

Cypress.Commands.add('routeProgramAction', (mutator = _.identity) => {
  cy.intercept('GET', '/api/program-actions/*', {
    body: mutator({
      data: getResource(_.sample(fxProgramActions), 'program-actions'),
      included: [],
    }),
  })
    .as('routeProgramAction');
});

Cypress.Commands.add('routeProgramActions', (mutator = _.identity, programId) => {
  const data = getResource(_.sample(fxProgramActions, 20), 'program-actions');
  const program = _.sample(fxPrograms);
  program.id = programId;

  _.each(data, action => {
    action.relationships = getProgramActionRelationships({
      program,
      owner: _.random(1) ? _.sample(fxTestTeams) : null,
    });
  });

  cy.intercept('GET', '/api/programs/**/relationships/actions*', {
    body: mutator({
      data,
      included: [],
    }),
  })
    .as('routeProgramActions');
});

Cypress.Commands.add('routeProgramFlowActions', (mutator = _.identity, flowId = '1') => {
  const data = getResource(_.sample(fxProgramActions, 20), 'program-actions');
  const program = _.sample(fxPrograms);
  const programFlow = _.sample(fxProgramFlows);
  programFlow.id = flowId;

  _.each(data, action => {
    action.relationships = getProgramActionRelationships({
      program,
      programFlow,
      owner: _.random(1) ? _.sample(fxTestTeams) : null,
    });
  });

  cy.intercept('GET', '/api/program-flows/**/actions', {
    body: mutator({
      data,
      included: [],
    }),
  })
    .as('routeProgramFlowActions');
});

Cypress.Commands.add('routeAllProgramActions', (mutator = _.identity, programIds) => {
  const data = getResource(_.sample(fxProgramActions, 20), 'program-actions');
  const program = _.sample(fxPrograms);
  program.id = _.sample(programIds);

  _.each(data, action => {
    action.relationships = getProgramActionRelationships({
      program,
      owner: _.random(1) ? _.sample(fxTestTeams) : null,
    });
  });

  cy.intercept('GET', '/api/program-actions?*', {
    body: mutator({
      data,
      included: [],
    }),
  })
    .as('routeAllProgramActions');
});
