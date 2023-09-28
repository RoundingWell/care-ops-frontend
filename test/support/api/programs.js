import _ from 'underscore';
import { getResource } from 'helpers/json-api';

import fxPrograms from 'fixtures/collections/programs';

Cypress.Commands.add('routePrograms', (mutator = _.identity) => {
  cy.intercept('GET', '/api/programs', {
    body: mutator({
      data: getResource(_.sample(fxPrograms, 10), 'programs'),
      included: [],
    }),
  })
    .as('routePrograms');
});

Cypress.Commands.add('routeProgram', (mutator = _.identity) => {
  cy.intercept('GET', '/api/programs/*', {
    body: mutator({
      data: getResource(_.sample(fxPrograms), 'programs'),
      included: [],
    }),
  })
    .as('routeProgram');
});

Cypress.Commands.add('routeProgramByProgramFlow', (mutator = _.identity) => {
  cy.intercept('GET', '/api/program-flows/**/program', {
    body: mutator({
      data: getResource(_.sample(fxPrograms), 'programs'),
      included: [],
    }),
  })
    .as('routeProgramByProgramFlow');
});
