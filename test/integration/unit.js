// Cypress dev unit runner
context('js/utils', function() {
  const req = require.context('../unit/', true, /^(.*\.(js$))[^.]*$/i);

  req.keys().forEach(req);

  after(function() {
    if (Cypress.env('COVERAGE') !== 'open') return;
    cy.exec('nyc report --reporter=html');
  });
});
