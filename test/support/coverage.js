
if (Cypress.env('COVERAGE')) {
  afterEach(function() {
    const coverageFile = `${ Cypress.config('coverageFolder') }/out.json`;

    if (global.__coverage__) {
      cy.task('coverage', global.__coverage__);
    }

    cy.window().then(win => {
      if (!win.__coverage__) return;

      cy.task('coverage', win.__coverage__).then(map => {
        cy.writeFile(coverageFile, map);
      });
    });

    if (Cypress.env('COVERAGE') === 'open') {
      cy.exec('nyc report --reporter=html');
    }
  });
}
