import { NIL as NIL_UUID } from 'uuid';

import { getErrors, getRelationship } from 'helpers/json-api';

import { getCurrentClinician } from 'support/api/clinicians';
import { roleReducedEmployee } from 'support/api/roles';

context('patient page', function() {
  specify('default route', function() {
    cy
      .routesForDefault()
      .routesForPatientDashboard()
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
        fx.data = getCurrentClinician({
          relationships: {
            workspaces: getRelationship([]),
          },
        });

        return fx;
      })
      .visit({ noWait: true });

    cy
      .get('.prelogin__message')
      .contains('Hold up, your account is not set up yet. Please notify your manager or administrator to correct this issue.');
  });

  specify('current clinician has reduced patient schedule access', function() {
    cy
      .routesForDefault()
      .routeCurrentClinician(fx => {
        fx.data = getCurrentClinician({
          relationships: {
            role: getRelationship(roleReducedEmployee),
          },
        });

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
        fx.data = getCurrentClinician({
          relationships: {
            team: getRelationship({ id: NIL_UUID }, 'teams'),
          },
        });

        return fx;
      })
      .visit({ noWait: true });

    cy
      .get('.prelogin__message')
      .contains('Hold up, your account is not set up yet. Please notify your manager or administrator to correct this issue.');
  });

  // Server should return 403, but for good measure
  specify('current clinician is not enabled', function() {
    cy
      .routeCurrentClinician(fx => {
        fx.data = getCurrentClinician({
          attributes: {
            enabled: false,
          },
        });

        return fx;
      })
      .visit({ noWait: true });

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
      .as('routeClinicianDisabled')
      .visit({ noWait: true })
      .wait('@routeClinicianDisabled');

    cy
      .get('.prelogin__message')
      .contains('Hold up, your account is not set up yet. Please notify your manager or administrator to correct this issue.');
  });
});
