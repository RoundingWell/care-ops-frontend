Cypress.on('window:before:load', function(win) {
  win.sessionStorage.setItem('cypress', 'cypress-mock-token');

  win.onerror = function() {
    cy.onUncaughtException.apply(cy, arguments);
  };

  cy.stub(win, 'open');
});

beforeEach(function() {
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

