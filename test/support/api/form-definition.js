import _ from 'underscore';

import fxTestFormDefinition from 'fixtures/test/form-definition';

Cypress.Commands.add('routeFormDefinition', (mutator = _.identity) => {
  cy
    .intercept('GET', '/api/forms/*/definition', {
      body: mutator(fxTestFormDefinition),
    })
    .as('routeFormDefinition');
});

Cypress.Commands.add('routeFormActionDefinition', (mutator = _.identity) => {
  cy
    .intercept('GET', '/api/actions/*/form/definition', {
      body: mutator(fxTestFormDefinition),
    })
    .as('routeFormActionDefinition');
});
