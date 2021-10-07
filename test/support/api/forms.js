import _ from 'underscore';
import { getResource } from 'helpers/json-api';

Cypress.Commands.add('routeForms', (mutator = _.identity) => {
  cy
    .fixture('collections/forms').as('fxForms')
    .fixture('test/forms').as('fxTestForms');

  cy.route({
    url: '/api/forms',
    response() {
      return mutator({
        data: getResource(_.union(this.fxTestForms, _.sample(this.fxForms, 5)), 'forms'),
        included: [],
      });
    },
  })
    .as('routeForms');
});

Cypress.Commands.add('routeFormDefinition', (mutator = _.identity) => {
  cy
    .fixture('test/form-definition').as('fxTestFormDefinition');

  cy.route({
    url: '/api/forms/*/definition',
    response() {
      return mutator(this.fxTestFormDefinition);
    },
  })
    .as('routeFormDefinition');
});

Cypress.Commands.add('routeFormActionDefinition', (mutator = _.identity) => {
  cy
    .fixture('test/form-definition').as('fxTestFormDefinition');

  cy.route({
    url: '/api/actions/*/form/definition',
    response() {
      return mutator(this.fxTestFormDefinition);
    },
  })
    .as('routeFormActionDefinition');
});

Cypress.Commands.add('routeFormResponse', (mutator = _.identity) => {
  cy
    .fixture('test/form-response').as('fxTestFormResponse');

  cy.route({
    url: '/api/form-responses/*/response',
    response() {
      return mutator(this.fxTestFormResponse);
    },
  })
    .as('routeFormResponse');
});

Cypress.Commands.add('routeFormFields', (mutator = _.identity) => {
  cy
    .fixture('test/form-fields').as('fxTestFormFields');

  cy
    .route({
      url: '/api/forms/**/fields*',
      response() {
        return mutator({
          data: getResource(_.sample(this.fxTestFormFields), 'form-fields'),
          included: [],
        });
      },
    })
    .as('routeFormFields');
});

Cypress.Commands.add('routeFormActionFields', (mutator = _.identity) => {
  cy
    .fixture('test/form-fields').as('fxTestFormFields');

  cy
    .route({
      url: '/api/actions/**/form/fields*',
      response() {
        return mutator({
          data: getResource(_.sample(this.fxTestFormFields), 'form-fields'),
          included: [],
        });
      },
    })
    .as('routeFormActionFields');
});
