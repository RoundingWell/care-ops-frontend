context('report', function() {
  specify('display report', function() {
    cy
      .server()
      .routeReports()
      .routeReport(fx => {
        fx.data.id = '1';
        fx.data.attributes.name = 'Test Report';

        return fx;
      })
      .visit('/reports/1')
      .wait('@routeReport');

    cy
      .get('.report__frame')
      .find('.report__context-trail')
      .should('contain', 'Test Report')
      .find('.js-back')
      .click();

    cy
      .url()
      .should('not.contain', 'reports/1')
      .should('contain', 'reports');
  });

  specify('report does not exist', function() {
    cy
      .server()
      .routeReports()
      .routeReport(fx => {
        return null;
      })
      .visit('/reports/1')
      .wait('@routeReport');

    cy
      .url()
      .should('not.contain', 'reports/1')
      .should('contain', 'reports');

    cy
      .get('.alert-box__body')
      .should('contain', 'The Report you requested does not exist.');
  });
});
