context('Patient Form', function() {
  specify('routing to form', function() {
    cy
      .visit('/form/1');

    cy
      .get('[data-nav-region]')
      .should('not.be.visible');

    // TODO: replace with on-screen navigation when available
    cy
      .get('[data-nav-region]')
      .find('[data-patients-region] .app-nav__link')
      .last()
      .click({ force: true });

    cy
      .get('[data-nav-region]')
      .should('be.visible');
  });
});
