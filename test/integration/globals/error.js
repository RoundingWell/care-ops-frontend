import { getErrors } from 'helpers/json-api';

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

  specify('401 token error', function() {
    cy
      .intercept('GET', '/api/clinicians/me', {
        statusCode: 401,
        body: {
          errors: getErrors({
            status: '401',
            code: '4400',
            title: 'Unauthorized',
            detail: 'Access token is required',
          }),
        },
      })
      .as('routeCurrentClinician')
      .visit({ noWait: true });

    cy
      .wait('@routeCurrentClinician');

    cy
      .url()
      .should('contain', '/logout');
  });

  specify('401 user error', function() {
    cy
      .intercept('GET', '/api/clinicians/me', {
        statusCode: 401,
        body: {
          errors: getErrors({
            status: '401',
            code: '5000',
            title: 'Unauthorized',
            detail: 'Access token is valid, but user is disabled',
          }),
        },
      })
      .as('routeCurrentClinician')
      .visit({ noWait: true });

    cy
      .wait('@routeCurrentClinician');

    cy
      .get('.prelogin')
      .contains('Hold up');
  });


  specify('500 error', function() {
    cy
      .intercept('GET', '/api/clinicians/me', {
        statusCode: 500,
        body: {},
      })
      .as('routeCurrentClinician')
      .visit({ noWait: true });

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
