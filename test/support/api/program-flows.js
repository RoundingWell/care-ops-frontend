import _ from 'underscore';
import { getResource, getRelationship, getIncluded } from 'helpers/json-api';

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

Cypress.Commands.add('routeProgramFlowActions', (mutator = _.identity, programFlowId) => {
  cy
    .fixture('collections/program-flows').as('fxProgramFlows')
    .fixture('collections/program-flow-actions').as('fxProgramFlowActions')
    .fixture('collections/program-actions').as('fxProgramActions')
    .fixture('test/roles').as('fxRoles');

  cy.route({
    url: '/api/program-flows/**/relationships/actions',
    response() {
      const data = getResource(_.sample(this.fxProgramFlowActions, 10), 'program-flows-actions');
      const programActions = getResource(_.sample(this.fxProgramActions, 10), 'program-actions');
      const programFlow = _.sample(this.fxProgramFlows);
      programFlow.id = programFlowId;

      _.each(data, (action, index) => {
        action.relationships = {
          'program-flow': { data: getRelationship(programFlow, 'program-flow') },
          'program-action': { data: getRelationship(programActions[index], 'program-actions') },
        };
      });

      // NOTE: program actions on flows do not have program relationships
      _.each(programActions, programAction => {
        programAction.relationships = {
          'program': { data: null },
          'role': { data: _.random(1) ? null : getRelationship(_.sample(this.fxRoles), 'roles') },
        };
      });

      return mutator({
        data,
        included: getIncluded([], programActions, 'program-actions'),
      });
    },
  })
    .as('routeProgramFlowActions');
});

