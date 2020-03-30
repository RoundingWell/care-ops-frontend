// ***********************************************
// This example commands.js shows you how to
// create the custom command: 'login'.
//
// The commands.js file is a great place to
// modify existing commands and create custom
// commands for use throughout your tests.
//
// You can read more about custom commands here:
// https://on.cypress.io/api/commands
// ***********************************************
//

Cypress.Commands.add('unit', cb => cy.window().then(win => {
  cb && cb.call(win, win);
}));

Cypress.Commands.add('visitComponent', ComponentName => {
  cy
    .visit();

  if (!ComponentName) return;

  cy
    .window()
    .its('Components')
    .its(ComponentName)
    .as(ComponentName);
});

Cypress.Commands.add('getRadio', cb => {
  cy
    .window()
    .should('have.property', 'Radio')
    .then(Radio => {
      cb(Radio);
    });
});

Cypress.Commands.add('getHook', cb => {
  Cypress.$('body').prepend(`
    <div style="position:absolute;height:100%;width:100%;background:#EEE;z-index:0">
      <div id="cy-hook"></div>
    </div>
  `);

  Cypress.$('.app-frame').hide();

  cy
    .get('#cy-hook')
    .as('hook')
    .then(cb);
});

Cypress.Commands.overwrite('visit', (originalFn, url, options = {}) => {
  let waits = [
    '@routeCurrentClinician',
    '@routeStates',
    '@routeRoles',
    '@routeForms',
    '@routeGroups',
    '@routeClinicians',
  ];

  if (!url) {
    url = Cypress.env('defaultRoute');
    waits.push('@routeFlows'); // default route
  }

  if (options.noWait) {
    waits = 0;
  }

  return cy
    .wrap(originalFn(url, options))
    .wait(waits);
});

Cypress.Commands.add('navigate', url => {
  cy
    .window()
    .its('Backbone')
    .its('history')
    .invoke('navigate', url, { trigger: true });
});
