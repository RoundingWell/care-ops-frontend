if (Cypress.env('coverage')) {
  afterEach(function() {
    const coverageFile = `${ Cypress.config('coverageFolder') }/out.json`;

    cy.window().then(win => {
      const coverage = win.__coverage__ || global.__coverage__;

      if (!coverage) return;

      cy.task('coverage', coverage).then(map => {
        cy.writeFile(coverageFile, map);

        if (Cypress.env('coverage') === 'open') {
          cy.exec('nyc report --reporter=html');
        }
      });
    });
  });
}
