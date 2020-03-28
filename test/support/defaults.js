// ***********************************************
// This example defaults.js shows you how to
// customize the internal behavior of Cypress.
//
// The defaults.js file is a great place to
// override defaults used throughout all tests.
//
// ***********************************************
//

Cypress.on('window:before:load', function(win) {
  win.sessionStorage.setItem('cypress', 'cypress-mock-token');

  win.onerror = function() {
    cy.onUncaughtException.apply(cy, arguments);
  };

  cy.stub(win, 'open');
});

beforeEach(function() {
  cy
    .server()
    .routeCurrentClinician()
    .routeStates()
    .routeRoles()
    .routeForms()
    .routeGroupsBootstrap()
    .routeFlows(); // Setup default route
});

Cypress.env('defaultRoute', '/worklist/owned-by');
