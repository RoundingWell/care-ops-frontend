// ***********************************************
// This example defaults.js shows you how to
// customize the internal behavior of Cypress.
//
// The defaults.js file is a great place to
// override defaults used throughout all tests.
//
// ***********************************************
//

import moment from 'moment';

Cypress.on('window:before:load', function(win) {
  win.sessionStorage.setItem('auth:expires', moment.utc().add(1, 'days').format('X'));

  win.onerror = function() {
    cy.onUncaughtException.apply(cy, arguments);
  };

  cy.stub(win, 'open');
});

beforeEach(function() {
  cy
    .server()
    .routePatients() // Setup default patients/all route
    .routeCurrentClinician();
});
