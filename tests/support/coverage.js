if (Cypress.env('COVERAGE')) {
  afterEach(function() {
    const coverageFile = `${ Cypress.config('coverageFolder') }/out.json`;

    cy.window().then(win => {
      const coverage = win.__coverage__ || global.__coverage__;

      if (!coverage) return;

      cy.task('coverage', coverage).then(map => {
        cy.writeFile(coverageFile, map);

        if (Cypress.env('COVERAGE') === 'open') {
          cy.exec('nyc report --reporter=html');
        }
      });
    });
  });
}
