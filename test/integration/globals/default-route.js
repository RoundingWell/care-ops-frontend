context('patient page', function() {
  specify('default route', function() {
    cy
      .routesForDefault()
      .routePatient()
      .routePatientActions()
      .visit();

    cy
      .url()
      .should('contain', 'one/worklist/owned-by');

    cy
      .get('.js-patient')
      .first()
      .click()
      .wait('@routePatient');

    cy
      .get('.patient__context-trail')
      .contains('Back to List')
      .click();

    cy
      .url()
      .should('contain', 'one/worklist/owned-by');
  });

  specify('current clinician has no workspaces', function() {
    cy
      .routeCurrentClinician(fx => {
        fx.data.relationships.workspaces.data = [];

        return fx;
      })
      .visit('/', { noWait: true });

    cy
      .get('.prelogin__message')
      .contains('Hold up, your account is not set up yet. Please notify your manager or administrator to correct this issue.');
  });

  specify('current clinician has reduced patient schedule access', function() {
    cy
      .routesForDefault()
      .routeCurrentClinician(fx => {
        fx.data.relationships.role = { data: { id: '44444' } };
        return fx;
      })
      .visit();

    cy
      .url()
      .should('contain', 'schedule');
  });

  specify('current clinician has no team', function() {
    cy
      .routeCurrentClinician(fx => {
        fx.data.relationships.team = {
          data: { id: '00000000-0000-0000-0000-000000000000' },
        };

        return fx;
      })
      .visit('/', { noWait: true });

    cy
      .get('.prelogin__message')
      .contains('Hold up, your account is not set up yet. Please notify your manager or administrator to correct this issue.');
  });

  // Server should return 403, but for good measure
  specify('current clinician is not enabled', function() {
    cy
      .routeCurrentClinician(fx => {
        fx.data.attributes.enabled = false;
        return fx;
      })
      .visit('/', { noWait: true });

    cy
      .get('.prelogin__message')
      .contains('Hold up, your account is not set up yet. Please notify your manager or administrator to correct this issue.');

    cy
      .get('.prelogin')
      .click('right');

    cy
      .get('.prelogin__message');
  });

  specify('current clinician has been disabled', function() {
    cy
      .route({
        url: '/api/clinicians/me',
        status: 401,
        response: {},
      })
      .as('routeClinicianDisabled')
      .visit('/', { noWait: true })
      .wait('@routeClinicianDisabled');

    cy
      .get('.prelogin__message')
      .contains('Hold up, your account is not set up yet. Please notify your manager or administrator to correct this issue.');
  });
});
