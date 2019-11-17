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
      .get('.form__context-trail')
      .should('contain', 'Testin')
      .should('contain', 'Test Form');

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
      .routeActionPatient()
      .visit('/patient-action/1/form/11111')
      .wait('@routeAction')
      .wait('@routeActionPatient');

    cy
      .get('[data-nav-region]')
      .should('not.be.visible');

    cy
      .get('iframe')
      .should('have.attr', 'src', '/formapp/11111');

    cy
      .get('.js-back')
      .click();

    cy
      .url()
      .should('contain', 'patients/all');
  });
});
