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

const _ = Cypress._;

Cypress.Commands.add('unit', cb => cy.window().then(win => {
  cb && cb.call(win, win);
}));

function tooltipContains(subject, msgs, test) {
  cy
    .wrap(subject)
    .trigger('mouseover')
  // wait for tooltip animation
    .wait(1);

  _.each(_.flatten([msgs]), test);

  cy
    .wrap(subject)
    .trigger('mouseout');
}

Cypress.Commands.add('tooltipContains', { prevSubject: true }, (subject, msgs) => {
  tooltipContains(subject, msgs, msg => {
    cy
      .get('#tooltip-region')
      .contains(msg);
  });
});

Cypress.Commands.add('tooltipContainsHtml', { prevSubject: true }, (subject, msgs) => {
  tooltipContains(subject, msgs, html => {
    cy
      .get('#tooltip-region')
      .find('.tooltip')
      .should('have.html', html);
  });
});
