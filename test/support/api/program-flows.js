import _ from 'underscore';
import { getResource, getRelationship } from 'helpers/json-api';

Cypress.Commands.add('routeProgramFlow', (mutator = _.identity) => {
  cy
    .fixture('collections/program-flows').as('fxProgramFlows')
    .fixture('collections/program-actions').as('fxProgramActions')
    .fixture('collections/programs').as('fxPrograms');

  cy.route({
    url: '/api/program-flows/*',
    response() {
      const data = getResource(_.sample(this.fxProgramFlows), 'program-flows');
      const program = _.sample(this.fxPrograms);
      const flowActions = _.sample(this.fxProgramActions, 10);

      data.relationships = {
        'program': { data: getRelationship(program, 'programs') },
        'program-actions': { data: getRelationship(flowActions, 'program-actions') },
        'owner': { data: null },
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
    .fixture('test/teams').as('fxTeams');

  cy.route({
    url: '/api/programs/**/relationships/flows*',
    response() {
      const data = getResource(_.sample(this.fxProgramFlows, 20), 'program-flows');
      const program = _.sample(this.fxPrograms);
      program.id = programId;

      _.each(data, flow => {
        flow.relationships = {
          program: { data: getRelationship(program, 'programs') },
          owner: { data: _.random(1) ? null : getRelationship(_.sample(this.fxTeams), 'teams') },
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

Cypress.Commands.add('routeAllProgramFlows', (mutator = _.identity, programId) => {
  cy
    .fixture('collections/program-actions').as('fxProgramActions')
    .fixture('collections/program-flows').as('fxProgramFlows')
    .fixture('collections/programs').as('fxPrograms')
    .fixture('test/teams').as('fxTeams');

  cy.route({
    url: '/api/program-flows?*',
    response() {
      const data = getResource(_.sample(this.fxProgramFlows, 20), 'program-flows');
      const programFlowActions = getResource(_.sample(this.fxProgramActions, 10), 'program-actions');
      const program = _.sample(this.fxPrograms);
      program.id = programId;

      _.each(data, (flow, index) => {
        flow.relationships = {
          'program': { data: getRelationship(program, 'programs') },
          'program-actions': { data: getRelationship(programFlowActions[index], 'program-actions') },
          'owner': { data: _.random(1) ? null : getRelationship(_.sample(this.fxTeams), 'teams') },
        };
      });

      return mutator({
        data,
        included: [],
      });
    },
  })
    .as('routeAllProgramFlows');
});

