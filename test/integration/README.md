# Cypress

## Coverage

Coverage report can be run with commands `npm run coverage` for running a full report and `npm run dev:coverage` for running individual reports on runs from the cypress runner.

**Note** You will want to make sure no other build processes are run/running that may overwrite the instrumented files for the coverage reports.

Reports can be found in `coverage/`.

## What is a Cypress Test?

A Cypress test is a functional test testing the built app from the user interface.
Our current usage of cypress stubs all server data so these are not end-to-end tests.

## Organization

Tests should be organized by parts of the app and feature.
ie:
`test/integration/clinicians`
`test/integration/patients/patient`

## Writing Tests

Tests should be organized as follows:
```js
context('Feature Name / App Section', function() {
  beforeEach(function() {
    // setup routes
    // init app and visit specific URL
  });

  afterEach(function() {
    // reset any variables after individual tests
  });

  specify('executing a data scenario', function() {
    // ...
  });

  specify('executing a different data scenario', function() {
    // ...
  });
});
```

## Code Style

Cypress was written by ruby/coffeescript people and follows chai-style chaining, perhaps to a fault.
This makes it difficult to understand what is the test assertion and what is test setup. Standards in unit tests such as using single assertions per `it` can't really apply in Cypress.

If groups of steps are not explicitly linked or dependent on each other, separate them into multiple lines:
```js
cy
  .get('@thingy') // Identifies the item or region this chunk is focusing on
  .find('.something').last() // logically groups commands finding an element (no need for .last() to be on its own line here)
  .click() // Explicit action
  .wait('@forSomething') // Another explicit action
  .then(function() { // And another
    cy.route('test', function() {
      return {
        pathway_data: data.fx.pathway.whatever
      };
    });
  });
```

A new `cy` should be added for new parent commands, as that is implicitly what is happening under-the-hood.
```js
cy
  .get('@thingy')
  .find('.something').last()
  .click() // Explicit action

// This `get` would reset the chain
// and nothing would know about `.something` or the click
cy
  .get('@thingy')
  .find('.foo');
```

## Testing Priorities

We should be testing the **business logic: how data (and interfaces) can be created, displayed, stored, and changed**.

It is important to test all various data scenarios. What does it do when no results are returned? When the logged in user is only in a single group? When a value is null?

## Fixtures

Fixtures (shared with unit tests) should be json files loaded in `test/fixtures/`.

They should be reusable and generic. Collections of models, specifically unique models should be defined in `collections/`.  One-off or special fixtures can be defined in the fixtures folder or similar related fixtures might be put in their own subdirectory such as `insights/`. Fixtures should not necessarily represent APIs, but be portions of APIs that can be composed together for testing. Modifications to the data such as adding a model to a collection or changing paricular values on a model should not break tests. Fixtures represent the portions of data needed for testing that are not part of the test directly.  Directly tested data should be stubbed specifically for the test and not stored in the fixture.

## Composing APIs

In Cypress, API routes are setup in `test/support/api/`. Each added file must be listed in `test/support/index.js`.
API's are organized by model and collection requests. Multiple versions of the same route might be added to support different scenarios. For instance both a check-in and a clinician response share the same API, but return different data depending on what is requested from the `id`. Each route follows the same format so that in practice the data can be mutated for a particular test scenario.

```js
Cypress.addParentCommand({
  routeCheckIn(mutator = _.identity) {
    cy.fixture('checkIn').as('fxCheckIn');
    cy.route({
      url: /ajax\/response\/\d+?/,
      response() {
        return mutator({
          data: this.fxCheckIn.checkin
        });
      }
    })
    .as('routeCheckIn');
  }
});
```

Notice two things. The route is aliased by the name of the parentCommand name.
And a mutator function is passed to the command such that the data for the endpoint passes through it before returning as the response to the endpoint.

## State Colors

When checking for states like errors, rather than checking for the existence of a class, use stateColors.
The available state colors are defined in [`./state-colors.js`](./state-colors.js).

```js
context('Clinician Profile', function() {
  const stateColors = Cypress.env('stateColors');
  //...
  cy
    .get('@phoneInput')
    .parent()
    .contains('The phone number you entered does not match the expected phone number format for United States. Try re-entering the number.')
    .should('have.css', 'color', stateColors.error);
```
