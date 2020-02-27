function writeCoverage(map) {
  const coverageFile = `${ Cypress.config('coverageFolder') }/out.json`;

  return cy.writeFile(coverageFile, map);
}

if (Cypress.env('COVERAGE')) {
  afterEach(function() {
    if (global.__coverage__) {
      cy
        .task('coverage', global.__coverage__)
        .then(writeCoverage);
    }

    cy.window().then(win => {
      if (!win.__coverage__) return;

      cy
        .task('coverage', win.__coverage__)
        .then(writeCoverage);
    });
  });

  after(function() {
    if (Cypress.env('COVERAGE') !== 'open') return;
    cy.exec('nyc report --reporter=html');
  });
}
