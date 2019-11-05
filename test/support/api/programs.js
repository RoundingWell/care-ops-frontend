import _ from 'underscore';
import { getResource } from 'helpers/json-api';

Cypress.Commands.add('routePrograms', (mutator = _.identity) => {
  cy
    .fixture('collections/programs').as('fxPrograms');

  cy.route({
    url: '/api/programs',
    response() {
      return mutator({
        data: getResource(_.sample(this.fxPrograms, 10), 'programs'),
        included: [],
      });
    },
  })
    .as('routePrograms');
});

Cypress.Commands.add('routeProgram', (mutator = _.identity) => {
  cy
    .fixture('collections/programs').as('fxPrograms');

  cy.route({
    url: '/api/programs/*',
    response() {
      return mutator({
        data: getResource(_.sample(this.fxPrograms), 'programs'),
        included: [],
      });
    },
  })
    .as('routeProgram');
});

Cypress.Commands.add('routeProgramByAction', (mutator = _.identity) => {
  cy
    .fixture('collections/programs').as('fxPrograms');

  cy.route({
    url: '/api/actions/**/program',
    response() {
      return mutator({
        data: getResource(_.sample(this.fxPrograms), 'programs'),
        included: [],
      });
    },
  })
    .as('routeProgramByAction');
});
