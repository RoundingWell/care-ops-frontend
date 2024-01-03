Cypress.on('window:before:load', function(win) {
  win.sessionStorage.setItem('cypress', 'cypress-mock-token');

  win.onerror = function() {
    cy.onUncaughtException.apply(cy, arguments);
  };

  cy.stub(win, 'open');
});

beforeEach(function() {
  // https://docs.cypress.io/api/commands/intercept#cyintercept-and-request-caching
  cy.intercept(
    '/api/**/*',
    { middleware: true },
    req => {
      req.on('before:response', res => {
        // force all API responses to not be cached
        res.headers['cache-control'] = 'no-store';
      });
    },
  );

  cy
    .routeCurrentClinician()
    .routeRoles()
    .routeTeams()
    .routeDirectories()
    .routeSettings()
    .routeWorkspaces()
    .routeWidgets()
    .routeWorkspaceClinicians()
    .routeStates()
    .routeForms();
});

