import { getDashboard } from 'support/api/dashboards';

context('dashboards all list', function() {
  specify('display dashboards list', function() {
    const testDashboards = [
      getDashboard({
        attributes: { name: 'Daily Dashboards' },
      }),
      getDashboard({
        attributes: { name: 'Weekly Dashboard' },
      }),
      getDashboard({
        attributes: { name: 'Monthly Dashboard' },
      }),
    ];

    cy
      .routeDashboards(fx => {
        fx.data = testDashboards;

        return fx;
      })
      .routeDashboard(fx => {
        fx.data = testDashboards[2];

        return fx;
      })
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
      .should('contain', `dashboards/${ testDashboards[2].id }`);
  });

  specify('empty dashboards list', function() {
    cy
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
