context('Patient Form', function() {
  beforeEach(function() {
    cy
      .server()
      .routeAction(fx => {
        fx.data.relationships.forms = { data: [{ id: '11111' }] };

        return fx;
      })
      .routeActionActivity()
      .routeActionPatient(fx => {
        fx.data.attributes.first_name = 'Testin';

        return fx;
      })
      .visit('patient-action/1/form/11111')
      .wait('@routeAction')
      .wait('@routeActionPatient');
  });

  specify('showing the form', function() {
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
  });

  specify('routing to form', function() {
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
