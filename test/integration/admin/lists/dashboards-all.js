context('dashboards all list', function() {
  specify('display dashboards list', function() {
    cy
      .server()
      .routeDashboards()
      .routeDashboard()
      .visit('/dashboards')
      .wait('@routeDashboards');

    cy
      .get('.table-list')
      .find('.table-list__item')
      .first()
      .should('contain', 'Daily Dashboard')
      .next()
      .should('contain', 'Weekly Dashboard')
      .next()
      .should('contain', 'Monthly Dashboard')
      .click()
      .wait('@routeDashboard');

    cy
      .url()
      .should('contain', 'dashboards/33333');
  });

  specify('empty dashboards list', function() {
    cy
      .server()
      .routeDashboards(fx => {
        fx.data = [];

        return fx;
      })
      .routeDashboard()
      .visit('/dashboards')
      .wait('@routeDashboards');

    cy
      .get('.table-list')
      .find('.table-empty-list')
      .contains('No Dashboards');
  });
});
