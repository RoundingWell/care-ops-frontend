import _ from 'underscore';
import { getResource, getRelationship } from 'helpers/json-api';

Cypress.Commands.add('routeProgramFlow', (mutator = _.identity) => {
  cy
    .fixture('collections/program-flows').as('fxProgramFlows')
    .fixture('collections/program-actions').as('fxProgramFlowActions')
    .fixture('collections/programs').as('fxPrograms');

  cy.route({
    url: '/api/program-flows/*',
    response() {
      const data = getResource(_.sample(this.fxProgramFlows), 'program-flows');
      const program = _.sample(this.fxPrograms);
      const flowActions = _.sample(this.fxProgramFlowActions, 10);

      data.relationships = {
        'program': { data: getRelationship(program, 'programs') },
        'program-flow-actions': { data: getRelationship(flowActions, 'program-flow-actions') },
        'role': { data: null },
      };

      return mutator({
        data,
        included: [],
      });
    },
  })
    .as('routeProgramFlow');
});

Cypress.Commands.add('routeProgramFlows', (mutator = _.identity, programId) => {
  cy
    .fixture('collections/program-flows').as('fxProgramFlows')
    .fixture('collections/programs').as('fxPrograms')
    .fixture('test/roles').as('fxRoles');

  cy.route({
    url: '/api/program-flows?*',
    response() {
      const data = getResource(_.sample(this.fxProgramFlows, 20), 'program-flows');
      const program = _.sample(this.fxPrograms);
      program.id = programId;

      _.each(data, action => {
        action.relationships = {
          program: { data: getRelationship(program, 'programs') },
          role: { data: _.random(1) ? null : getRelationship(_.sample(this.fxRoles), 'roles') },
        };
      });

      return mutator({
        data,
        included: [],
      });
    },
  })
    .as('routeProgramFlows');
});

Cypress.Commands.add('routeProgramFlowActions', (mutator = _.identity, programId, programFlowId) => {
  cy
    .fixture('collections/program-flows').as('fxProgramFlows')
    .fixture('collections/program-actions').as('fxProgramFlowActions')
    .fixture('test/roles').as('fxRoles');

  cy.route({
    url: '/api/program-flows/**/relationships/actions',
    response() {
      const data = getResource(_.sample(this.fxProgramFlowActions, 10), 'program-actions');
      const programFlow = _.sample(this.fxProgramFlows);
      programFlow.id = programFlowId;

      _.each(data, action => {
        action.relationships = {
          'program-flow': { data: getRelationship(programFlow, 'program-flow') },
          'role': { data: _.random(1) ? null : getRelationship(_.sample(this.fxRoles), 'roles') },
        };
      });

      return mutator({
        data,
        included: [],
      });
    },
  })
    .as('routeProgramFlowActions');
});

