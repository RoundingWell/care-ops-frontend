context('reports all list', function() {
  specify('display reports list', function() {
    cy
      .server()
      .routeReports()
      .routeReport()
      .visit('/reports')
      .wait('@routeReports');

    cy
      .get('.table-list')
      .find('.table-list__item')
      .first()
      .should('contain', 'Daily Report')
      .next()
      .should('contain', 'Weekly Report')
      .next()
      .should('contain', 'Monthly Report')
      .click()
      .wait('@routeReport');

    cy
      .url()
      .should('contain', 'reports/33333');
  });
});
