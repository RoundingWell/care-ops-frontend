context('Patient Form', function() {
  specify('deleted action', function() {
    cy
      .server()
      .route({
        url: '/api/actions/1',
        status: 404,
        response: {
          errors: [{
            id: '1',
            status: '404',
            title: 'Not Found',
            detail: 'Cannot find action',
            source: { parameter: 'actionId' },
          }],
        },
      })
      .as('routeAction')
      .routeActionPatient()
      .visit('/patient-action/1/form/11111')
      .wait('@routeAction')
      .wait('@routeActionPatient');

    cy
      .get('.alert-box__body')
      .should('contain', 'The Action you requested does not exist.');

    cy
      .url()
      .should('not.contain', 'patient-action/1/form/11111');
  });

  specify('showing the form', function() {
    let printStub;

    cy
      .server()
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.relationships.forms = { data: [{ id: '11111' }] };

        return fx;
      })
      .routeActionActivity()
      .routeActionPatient(fx => {
        fx.data.attributes.first_name = 'Testin';

        return fx;
      })
      .visit('/patient-action/1/form/11111')
      .wait('@routeAction')
      .wait('@routeActionPatient');

    cy
      .get('.form__iframe iframe')
      .then($iframe => {
        const contentWindow = $iframe[0].contentWindow;
        printStub = cy.stub(contentWindow, 'print');
      });

    cy
      .get('.form__context-trail')
      .should('contain', 'Testin')
      .should('contain', 'Test Form');

    cy
      .get('.js-print-button')
      .click()
      .then(() => {
        expect(printStub).to.have.been.calledOnce;
      });

    cy
      .get('.action-sidebar')
      .find('.js-close')
      .click();

    cy
      .get('.action-sidebar')
      .should('not.exist');

    cy
      .get('.js-sidebar-button')
      .should('not.have.class', 'is-selected')
      .click();

    cy
      .get('.action-sidebar');

    cy
      .get('.js-sidebar-button')
      .should('have.class', 'is-selected')
      .click();

    cy
      .get('.action-sidebar')
      .should('not.exist');

    cy
      .get('.js-sidebar-button')
      .should('not.have.class', 'is-selected')
      .click();

    cy
      .get('.action-sidebar')
      .find('.js-menu')
      .click();

    cy
      .route({
        status: 204,
        method: 'DELETE',
        url: '/api/actions/1',
        response: {},
      })
      .as('routeDeleteAction');

    cy
      .get('.picklist')
      .contains('Delete Action')
      .click();

    cy
      .get('.alert-box__body')
      .should('contain', 'The Action was deleted successfully.');

    cy
      .url()
      .should('not.contain', 'patient-action/1/form/11111');
  });

  specify('routing to form', function() {
    cy
      .server()
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.relationships.forms = { data: [{ id: '11111' }] };

        return fx;
      })
      .routeActionActivity()
      .routeActionPatient(fx => {
        fx.data.id = '1';

        return fx;
      })
      .visit('/patient-action/1/form/11111')
      .wait('@routeAction')
      .wait('@routeActionPatient');

    cy
      .get('[data-nav-region]')
      .should('not.be.visible');

    cy
      .get('iframe')
      .should('have.attr', 'src', '/formapp/11111/a/1');

    cy
      .get('.js-back')
      .click();

    cy
      .url()
      .should('contain', 'patient/1/action/1');
  });

  specify('routing to flow-action form', function() {
    cy
      .server()
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.relationships.forms = { data: [{ id: '11111' }] };
        fx.data.relationships.flow = { data: { id: '1' } };
        return fx;
      })
      .routeActionActivity()
      .routeActionPatient(fx => {
        fx.data.id = '1';

        return fx;
      })
      .visit('/patient-action/1/form/11111')
      .wait('@routeAction')
      .wait('@routeActionPatient');

    cy
      .get('[data-nav-region]')
      .should('not.be.visible');

    cy
      .get('iframe')
      .should('have.attr', 'src', '/formapp/11111/a/1');

    cy
      .route({
        status: 204,
        method: 'GET',
        url: '/api/flows/1',
        response: {},
      })
      .as('routeFlow');

    cy
      .route({
        status: 204,
        method: 'GET',
        url: '/api/flows/1/patient',
        response: {},
      })
      .as('routeFlowPatient');

    cy
      .route({
        status: 204,
        method: 'GET',
        url: '/api/flows/1/relationships/actions',
        response: {},
      })
      .as('routeFlowActions');

    cy
      .get('.js-back')
      .click();

    cy
      .url()
      .should('contain', 'flow/1/action/1');
  });
});
