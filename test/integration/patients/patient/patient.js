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
      .routePatientActions(_.identity, '2')
      .routePatientFlows(_.identity, '2')
      .visit('/patient/dashboard/1')
      .wait('@routePatient')
      .wait('@routePatientActions')
      .wait('@routePatientFlows');

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
      .wait('@routePatient')
      .wait('@routePatientFields')
      .wait('@routePatientActions')
      .wait('@routePatientFlows');

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
      .server()
      .routePatient(fx => {
        fx.data.id = '1';

        return fx;
      })
      .routePatientActions(_.identity, '1')
      .routePatientFlows(_.identity, '1')
      .routeActionActivity()
      .routePrograms()
      .routeAllProgramActions()
      .routeAllProgramFlows()
      .visit('/patient/dashboard/1')
      .wait('@routePatientActions')
      .wait('@routePatientFlows')
      .wait('@routePatient');

    cy
      .get('.patient__layout')
      .find('.patient__tab--selected')
      .contains('Dashboard');

    cy
      .get('.patient__layout')
      .find('.js-data-events')
      .click();

    cy
      .get('.patient__layout')
      .find('.patient__tab--selected')
      .contains('Data & Events');

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
      .server()
      .routePatient(fx => {
        fx.data.id = '1';

        return fx;
      })
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.relationships.state = { data: { id: '55555' } };

        return fx;
      })
      .routePatientActions(_.identity, '1')
      .routePatientFlows(_.identity, '1')
      .routeActionActivity()
      .routePrograms()
      .routeAllProgramActions()
      .routeAllProgramFlows()
      .routeFlow()
      .routePatientFlowProgramFlow()
      .routePatientByFlow()
      .visit('/patient/1/action/1')
      .wait('@routePatientActions')
      .wait('@routePatientFlows')
      .wait('@routePatient')
      .wait('@routeAction');

    cy
      .get('.patient__layout')
      .find('.patient__tab--selected')
      .contains('Data & Events');

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
