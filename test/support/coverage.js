import { each, uniq } from 'underscore';

let windowCoverageObjects;

function storeCoverage(win) {
  const coverage = win.__coverage__;

  if (!coverage) return;

  windowCoverageObjects.push(coverage);
}

if (Cypress.env('COVERAGE')) {
  beforeEach(function() {
    windowCoverageObjects = [];

    // save reference to coverage for each app window loaded in the test
    cy.on('window:load', storeCoverage);

    // save reference if visiting a page inside a before() hook
    cy.window({ log: false }).then(storeCoverage);
  });


  afterEach(function() {
    each(uniq(windowCoverageObjects), coverage => {
      cy.task('coverage', coverage);
    });

    cy.task('coverage', global.__coverage__);

    cy.window().then(win => {
      cy.task('coverage', win.__coverage__);
    });
  });

  after(function() {
    cy.task('write');
    if (!Cypress.config('isInteractive')) return;
    cy.exec('npm run coverage:report', { log: true });
  });
}
