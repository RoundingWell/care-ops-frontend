import _ from 'underscore';
import { getResource, getRelationship } from 'helpers/json-api';

Cypress.Commands.add('routeProgramAction', (mutator = _.identity) => {
  cy
    .fixture('collections/program-actions').as('fxProgramActions');

  cy.route({
    url: '/api/program-actions/*',
    response() {
      return mutator({
        data: getResource(_.sample(this.fxProgramActions), 'program-actions'),
        included: [],
      });
    },
  })
    .as('routeProgramAction');
});

Cypress.Commands.add('routeProgramActions', (mutator = _.identity, programId) => {
  cy
    .fixture('collections/program-actions').as('fxProgramActions')
    .fixture('collections/programs').as('fxPrograms')
    .fixture('test/roles').as('fxRoles');

  cy.route({
    url: '/api/programs/**/relationships/actions*',
    response() {
      const data = getResource(_.sample(this.fxProgramActions, 20), 'program-actions');
      const program = _.sample(this.fxPrograms);
      program.id = programId;

      _.each(data, action => {
        action.relationships = {
          program: { data: getRelationship(program, 'programs') },
          owner: { data: _.random(1) ? null : getRelationship(_.sample(this.fxRoles), 'roles') },
        };
      });

      return mutator({
        data,
        included: [],
      });
    },
  })
    .as('routeProgramActions');
});

Cypress.Commands.add('routeAllProgramActions', (mutator = _.identity, programIds) => {
  cy
    .fixture('collections/program-actions').as('fxProgramActions')
    .fixture('collections/programs').as('fxPrograms')
    .fixture('test/roles').as('fxRoles');

  cy.route({
    url: '/api/program-actions?*',
    response() {
      const data = getResource(_.sample(this.fxProgramActions, 20), 'program-actions');
      const program = _.sample(this.fxPrograms);
      program.id = _.sample(programIds);

      _.each(data, action => {
        action.relationships = {
          program: { data: getRelationship(program, 'programs') },
          owner: { data: _.random(1) ? null : getRelationship(_.sample(this.fxRoles), 'roles') },
        };
      });

      return mutator({
        data,
        included: [],
      });
    },
  })
    .as('routeAllProgramActions');
});

