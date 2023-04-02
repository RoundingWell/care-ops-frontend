context('patient page', function() {
  specify('context trail', function() {
    cy
      .routesForPatientDashboard()
      .routeActions()
      .routePatient(fx => {
        fx.data.id = '1';
        fx.data.attributes.first_name = 'First';
        fx.data.attributes.last_name = 'Last';

        return fx;
      })
      .visit('/patient/dashboard/1')
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
        fx.data.id = '1';

        return fx;
      })
      .visit('/patient/dashboard/1')
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
    cy
      .routesForPatientAction()
      .routePatient(fx => {
        fx.data.id = '1';

        return fx;
      })
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.relationships.state = { data: { id: '55555' } };

        return fx;
      })
      .routeFlow()
      .routePatientByFlow()
      .visit('/patient/1/action/1')
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
