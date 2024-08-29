import { getDashboard } from 'support/api/dashboards';

context('dashboard', function() {
  specify('display dashboard', function() {
    const testDashboard = getDashboard({
      attributes: {
        name: 'Test Dashboard',
        embed_url: '/test_dashboard',
      },
    });

    cy
      .routeDashboards()
      .routeDashboard(fx => {
        fx.data = testDashboard;

        return fx;
      })
      .visit(`/dashboards/${ testDashboard.id }`)
      .wait('@routeDashboard');

    cy
      .get('.dashboard__frame')
      .find('.dashboard__context-trail')
      .should('contain', 'Test Dashboard');

    cy
      .get('.dashboard__frame')
      .find('.dashboard__iframe iframe')
      .should('have.attr', 'src', '/test_dashboard');

    cy
      .get('.dashboard__frame')
      .find('.dashboard__context-trail .js-back')
      .click();

    cy
      .url()
      .should('not.contain', `dashboards/${ testDashboard.id }`)
      .should('contain', 'dashboards');
  });

  specify('dashboard does not exist', function() {
    cy
      .routeDashboards()
      .intercept('GET', '/api/dashboards/1', {
        statusCode: 404,
        body: {
          errors: [{
            id: '1',
            status: '404',
            title: 'Not Found',
            detail: 'Cannot find dashboard',
          }],
        },
      })
      .as('routeDashboard404')
      .visit('/dashboards/1')
      .wait('@routeDashboard404');

    cy
      .url()
      .should('not.contain', 'dashboards/1')
      .should('contain', 'dashboards');

    cy
      .get('.alert-box__body')
      .should('contain', 'The Dashboard you requested does not exist.');
  });
});
