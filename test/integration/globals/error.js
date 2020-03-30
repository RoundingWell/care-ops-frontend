context('Global Error Page', function() {
  specify('404 not found', function() {
    cy
      .visit('/404');

    cy
      .get('.error-page')
      .should('contain', 'Something went wrong.')
      .and('contain', ' This page doesn\'t exist.');

    cy
      .get('.error-page')
      .contains('Back to Your Workspace')
      .click();

    cy
      .get('.error-page')
      .should('not.exist');
  });

  specify('403 forbidden', function() {
    cy
      .server()
      .route({
        url: '/api/clinicians/me',
        status: 403,
        response: {},
      })
      .as('routeCurrentClinician')
      .visit(null, { noWait: true });

    cy
      .get('.error-page')
      .should('contain', 'Forbidden.');

    cy
      .get('.error-page')
      .contains('Back to Your Workspace')
      .click();

    cy
      .get('.error-page')
      .should('not.exist');
  });

  specify('500 error', function() {
    cy
      .server()
      .route({
        url: '/api/clinicians/me',
        status: 500,
        response: {},
      })
      .as('routeCurrentClinician')
      .visit(null, { noWait: true });

    cy
      .get('.error-page')
      .should('contain', 'Error code: 500.');

    cy
      .get('.error-page')
      .contains('Back to Your Workspace')
      .click();

    cy
      .get('.error-page')
      .should('not.exist');
  });
});
