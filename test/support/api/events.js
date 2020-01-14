import _ from 'underscore';

Cypress.Commands.add('routeActionActivity', (mutator = _.identity) => {
  cy
    .fixture('test/events').as('fxEvents');

  cy.route({
    url: '/api/actions/**/activity*',
    response() {
      let events = _.clone(this.fxEvents);
      const createEvent = events.shift();
      events = _.sample(events, 4);
      events.unshift(createEvent);

      return mutator({
        data: events,
      });
    },
  })
    .as('routeActionActivity');
});

Cypress.Commands.add('routeFlowActivity', (mutator = _.identity) => {
  cy
    .fixture('test/flow-events').as('fxEvents');

  cy.route({
    url: '/api/flows/**/activity*',
    response() {
      const events = _.clone(this.fxEvents);
      const createEvent = events.shift();
      events.unshift(createEvent);

      return mutator({
        data: events,
      });
    },
  })
    .as('routeFlowActivity');
});
