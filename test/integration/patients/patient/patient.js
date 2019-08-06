import _ from 'underscore';

context('patient page', function() {
  specify('context trail', function() {
    cy
      .server()
      .routePatient(fx => {
        fx.data.id = '1';
        fx.data.attributes.first_name = 'First';
        fx.data.attributes.last_name = 'Last';

        return fx;
      })
      .routePatientActions(_.identity, '1')
      .visit('/patient/dashboard/1')
      .wait('@routePatient');

    cy
      .get('.patient__context-trail')
      .should('contain', 'First Last')
      .should('not.contain', 'Back to List');

    cy
      .get('.app-nav')
      .contains('All Patients')
      .click();

    cy
      .go('back');

    cy
      .get('.patient__context-trail')
      .should('contain', 'First Last')
      .contains('Back to List')
      .click();

    cy
      .url()
      .should('contain', 'patients/all');
  });
  specify('patient routing', function() {
    cy
      .server()
      .routePatient(fx => {
        fx.data.id = '1';

        return fx;
      })
      .routePatientActions(_.identity, '1')
      .routeActionActivity()
      .visit('/patient/dashboard/1')
      .wait('@routePatient');

    cy
      .get('.patient__layout')
      .find('.patient-tab--selected')
      .contains('Dashboard');

    cy
      .get('.patient__layout')
      .find('.js-data-events')
      .click();

    cy
      .get('.patient__layout')
      .find('.patient-tab--selected')
      .contains('Data & Events');

    cy
      .get('.patient__layout')
      .find('.js-dashboard')
      .click();

    cy
      .get('.patient__layout')
      .find('.patient-tab--selected')
      .contains('Dashboard');
  });
});
