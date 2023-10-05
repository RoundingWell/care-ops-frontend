import _ from 'underscore';

import fxTestActionEvents from 'fixtures/test/action-events';
import fxTestFlowEvents from 'fixtures/test/flow-events';

Cypress.Commands.add('routeActionActivity', (mutator = _.identity) => {
  let events = _.clone(fxTestActionEvents);
  const createEvent = events.shift();
  events = _.sample(events, 4);
  events.unshift(createEvent);

  cy.intercept('GET', '/api/actions/**/activity*', {
    body: mutator({
      data: events,
    }),
  })
    .as('routeActionActivity');
});

Cypress.Commands.add('routeFlowActivity', (mutator = _.identity) => {
  cy.intercept('GET', '/api/flows/**/activity*', {
    body: mutator({
      data: fxTestFlowEvents,
    }),
  })
    .as('routeFlowActivity');
});
