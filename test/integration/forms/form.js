context('Patient Form', function() {
  specify('routing to form', function() {
    cy
      .visit('/form/1');

    cy
      .get('[data-nav-region]')
      .should('not.be.visible');

    cy
      .get('iframe')
      .should('have.attr', 'src', '/formapp/678sfd');

    cy
      .get('.js-back')
      .click();

    cy
      .url()
      .should('contain', 'patients/all');
  });
});
