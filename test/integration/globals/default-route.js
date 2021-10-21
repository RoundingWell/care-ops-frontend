import _ from 'underscore';

context('patient page', function() {
  specify('default route', function() {
    cy
      .server()
      .routePatient()
      .routePatientActions()
      .visit();

    cy
      .url()
      .should('contain', 'worklist/owned-by');

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
      .should('contain', 'worklist/owned-by');
  });

  specify('current clinician has no groups', function() {
    cy
      .server()
      .routeGroupsBootstrap(_.identity, null, fx => {
        const currentClinician = _.find(fx.data, clinician => clinician.id === '11111');

        currentClinician.relationships.groups = [];

        return fx;
      })
      .visit('/');

    cy
      .get('.prelogin__message')
      .contains('Hold up, your account is not set up yet. Please notify your manager or administrator to correct this issue.');
  });

  specify('current clinician has no role', function() {
    cy
      .server()
      .routeGroupsBootstrap(_.identity, null, fx => {
        const currentClinician = _.find(fx.data, clinician => clinician.id === '11111');

        currentClinician.attributes._role = null;

        return fx;
      })
      .routeCurrentClinician(fx => {
        fx.data.attributes._role = null;
        return fx;
      })
      .visit('/');

    cy
      .get('.prelogin__message')
      .contains('Hold up, your account is not set up yet. Please notify your manager or administrator to correct this issue.');
  });

  specify('current clinician has never been active', function() {
    cy
      .server()
      .routeCurrentClinician(fx => {
        fx.data.attributes.last_active_at = null;
        return fx;
      })
      .visit('/');

    cy
      .get('.prelogin__message')
      .contains('Hold up, your account is not set up yet. Please notify your manager or administrator to correct this issue.');

    cy
      .get('.prelogin')
      .click('right');

    cy
      .get('.prelogin__message');
  });

  // Server should return 403, but for good measure
  specify('current clinician is not enabled', function() {
    cy
      .server()
      .routeCurrentClinician(fx => {
        fx.data.attributes.enabled = false;
        return fx;
      })
      .visit('/');

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
      .server()
      .route({
        url: '/api/clinicians/me',
        status: 403,
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
