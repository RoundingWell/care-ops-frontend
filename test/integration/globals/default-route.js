import _ from 'underscore';

context('patient page', function() {
  specify('default route', function() {
    cy
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

  specify('current clinician has reduced patient schedule access', function() {
    cy
      .routeCurrentClinician(fx => {
        fx.data.attributes.access = 'employee';
        return fx;
      })
      .routeSettings(fx => {
        const reducedPatientSchedule = _.find(fx.data, setting => setting.id === 'reduced_patient_schedule');
        reducedPatientSchedule.attributes.value = true;

        return fx;
      })
      .visit('/');

    cy
      .url()
      .should('contain', 'schedule');
  });

  specify('current clinician has no groups', function() {
    cy
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

  specify('current clinician has no team', function() {
    cy
      .routeGroupsBootstrap(_.identity, null, fx => {
        const currentClinician = _.find(fx.data, clinician => clinician.id === '11111');

        currentClinician.attributes._team = null;

        return fx;
      })
      .routeCurrentClinician(fx => {
        fx.data.attributes._team = null;
        return fx;
      })
      .visit('/');

    cy
      .get('.prelogin__message')
      .contains('Hold up, your account is not set up yet. Please notify your manager or administrator to correct this issue.');
  });

  specify('current clinician has never been active', function() {
    cy
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
