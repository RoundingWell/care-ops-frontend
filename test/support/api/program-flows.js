import _ from 'underscore';
import { getResource, getRelationship } from 'helpers/json-api';

Cypress.Commands.add('routeProgramFlow', (mutator = _.identity) => {
  cy
    .fixture('collections/program-flows').as('fxProgramFlows')
    .fixture('collections/programs').as('fxPrograms');

  cy.route({
    url: '/api/program-flows/*',
    response() {
      const data = getResource(_.sample(this.fxProgramFlows), 'program-flows');
      const program = _.sample(this.fxPrograms);

      data.relationships = {
        program: { data: getRelationship(program, 'programs') },
        role: { data: null },
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


