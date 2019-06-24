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
    <div style="position:absolute;height:100%;width:100%;background:#EEE;">
      <div id="cy-hook"></div>
    </div>
  `);

  cy
    .get('#cy-hook')
    .as('hook')
    .then(cb);
});

Cypress.Commands.overwrite('visit', (originalFn, url = '/', options) => {
  return originalFn(url, options);
});
