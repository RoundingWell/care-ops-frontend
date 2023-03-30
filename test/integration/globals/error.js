context('Global Error Page', function() {
  beforeEach(function() {
    cy.routesForDefault();
  });

  specify('404 not found', function() {
    cy
      .visit('/route-does-not-exist');

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

  // NOTE: 'legacy' means the workspace name isn't included in the URL
  specify('404 not found - legacy routes', function() {
    cy
      .visit('/route-does-not-exist', { isRoot: true });

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

  // NOTE: 'legacy' means the workspace name isn't included in the URL
  specify('handle legacy routes', function() {
    cy
      .visit('/worklist/owned-by', { isRoot: true });

    cy
      .url()
      .should('contain', 'one/worklist/owned-by');

    cy
      .get('.error-page')
      .should('not.exist');
  });

  specify('500 error', function() {
    cy
      .route({
        url: '/api/clinicians/me',
        status: 500,
        response: {},
      })
      .as('routeCurrentClinician')
      .visit('/', { noWait: true });

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
