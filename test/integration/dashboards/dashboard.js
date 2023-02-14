context('dashboard', function() {
  specify('display dashboard', function() {
    cy
      .routeDashboards()
      .routeDashboard(fx => {
        fx.data.id = '1';
        fx.data.attributes.name = 'Test Dashboard';
        fx.data.attributes.embed_url = '/test_dashboard?foo=bar#p.baz=bazing';

        return fx;
      })
      .visit('/dashboards/1')
      .wait('@routeDashboard');

    cy
      .get('.dashboard__frame')
      .find('.dashboard__context-trail')
      .should('contain', 'Test Dashboard');

    cy
      .get('.dashboard__frame')
      .find('.dashboard__iframe iframe')
      .should('have.attr', 'src', '/test_dashboard?foo=bar#p.baz=bazing');

    cy
      .get('.dashboard__frame')
      .find('.dashboard__context-trail .js-back')
      .click();

    cy
      .url()
      .should('not.contain', 'dashboards/1')
      .should('contain', 'dashboards');
  });

  specify('dashboard does not exist', function() {
    cy
      .routeDashboards()
      .route({
        url: '/api/dashboards/1',
        status: 404,
        response: {
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
