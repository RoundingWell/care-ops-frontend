import _ from 'underscore';
import { getResource } from 'helpers/json-api';
import fxForms from 'fixtures/test/forms.json';

Cypress.Commands.add('routeForms', (mutator = _.identity) => {
  cy.route({
    url: '/api/forms',
    response() {
      // form.options is no longer included in the '/api/forms' api request
      const fxTestForms = _.map(fxForms, form => {
        form = _.clone(form);
        form.options = {};
        return form;
      });

      return mutator({
        data: getResource(fxTestForms, 'forms'),
        included: [],
      });
    },
  })
    .as('routeForms');
});

Cypress.Commands.add('routeForm', (mutator = _.identity, formId = '11111') => {
  cy.route({
    url: '/api/forms/*',
    response() {
      return mutator({
        data: getResource(_.find(fxForms, { id: formId }), 'forms'),
        included: [],
      });
    },
  })
    .as('routeForm');
});

Cypress.Commands.add('routeFormByAction', (mutator = _.identity, formId = '11111') => {
  cy.route({
    url: '/api/actions/*/form',
    response() {
      return mutator({
        data: getResource(_.find(fxForms, { id: formId }), 'forms'),
        included: [],
      });
    },
  })
    .as('routeFormByAction');
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

Cypress.Commands.add('routeLatestFormResponseByPatient', (mutator = _.identity) => {
  cy
    .fixture('test/form-response').as('fxTestFormResponse');

  cy.route({
    url: '/api/patients/**/form-responses/latest*',
    response() {
      return mutator(this.fxTestFormResponse);
    },
  })
    .as('routeLatestFormResponseByPatient');
});

Cypress.Commands.add('routeLatestFormResponseByAction', (mutator = _.identity) => {
  cy
    .fixture('test/form-response').as('fxTestFormResponse');

  cy.route({
    url: '/api/actions/**/form-responses/latest*',
    response() {
      return mutator(this.fxTestFormResponse);
    },
  })
    .as('routeLatestFormResponseByAction');
});
