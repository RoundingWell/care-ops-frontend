import { getRelationship } from 'helpers/json-api';

import { getPatient } from 'support/api/patients';
import { getAction } from 'support/api/actions';
import { stateDone } from 'support/api/states';

context('patient page', function() {
  const testPatient = getPatient({
    attributes: {
      first_name: 'First',
      last_name: 'Last',
    },
  });

  specify('context trail', function() {
    cy
      .routesForPatientDashboard()
      .routeActions()
      .routePatient(fx => {
        fx.data = testPatient;

        return fx;
      })
      .visit(`/patient/dashboard/${ testPatient.id }`)
      .wait('@routePatient');

    cy
      .get('.patient__context-trail')
      .should('contain', 'First Last')
      .should('not.contain', 'Back to List');

    cy
      .get('.app-nav')
      .contains('Owned By')
      .click();

    cy
      .go('back')
      .wait('@routePatient');

    cy
      .get('.patient__context-trail')
      .should('contain', 'First Last')
      .contains('Back to List')
      .click();

    cy
      .url()
      .should('contain', 'worklist/owned-by');
  });

  specify('patient routing', function() {
    cy
      .routesForPatientDashboard()
      .routePatient(fx => {
        fx.data = testPatient;

        return fx;
      })
      .visit(`/patient/dashboard/${ testPatient.id }`)
      .wait('@routePatient');

    cy
      .get('.patient__layout')
      .find('.patient__tab--selected')
      .contains('Dashboard');

    cy
      .get('.patient__layout')
      .find('.js-archive')
      .click();

    cy
      .get('.patient__layout')
      .find('.patient__tab--selected')
      .contains('Archive');

    cy
      .get('.patient__layout')
      .find('.js-dashboard')
      .click();

    cy
      .get('.patient__layout')
      .find('.patient__tab--selected')
      .contains('Dashboard');
  });

  specify('action routing', function() {
    const testAction = getAction({
      relationships: {
        state: getRelationship(stateDone),
      },
    });

    cy
      .routesForPatientAction()
      .routePatient(fx => {
        fx.data = testPatient;

        return fx;
      })
      .routeAction(fx => {
        fx.data = testAction;

        return fx;
      })
      .routeFlow()
      .routePatientByFlow()
      .visit(`/patient/${ testPatient.id }/action/${ testAction.id }`)
      .wait('@routePatient')
      .wait('@routeAction');

    cy
      .get('.patient__layout')
      .find('.patient__tab--selected')
      .contains('Archive');

    cy
      .get('.patient__layout')
      .find('.js-dashboard')
      .click();

    cy
      .get('[data-add-workflow-region]')
      .contains('Add')
      .click();

    cy
      .get('.picklist')
      .contains('New Action')
      .click();

    cy
      .get('.sidebar')
      .find('[data-name-region] .js-input')
      .should('have.attr', 'placeholder', 'New Action');

    cy
      .get('.sidebar')
      .find('.js-close')
      .click();

    cy
      .get('.sidebar')
      .should('not.exist');

    cy
      .get('.patient-sidebar');
  });
});
