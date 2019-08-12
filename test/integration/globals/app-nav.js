context('App Nav', function() {
  specify('display nav', function() {
    let logoutStub;
    cy
      .server()
      .routeGroupActions()
      .visit();

    cy
      .getRadio(Radio => {
        logoutStub = cy.stub();
        Radio.reply('auth', 'logout', logoutStub);
      });

    cy
      .get('.app-nav__header')
      .should('contain', 'Test Org Name')
      .should('contain', 'Clinician McTester')
      .click();

    cy
      .get('.picklist')
      .contains('Sign Out')
      .click()
      .then(() => {
        expect(logoutStub).to.have.been.calledOnce;
      });

    cy
      .get('[data-views-region]')
      .find('.app-nav__link')
      .first()
      .click()
      .should('have.class', 'is-selected');

    cy
      .get('[data-views-region]')
      .find('.app-nav__link')
      .last()
      .click()
      .should('have.class', 'is-selected');

    cy
      .get('[data-views-region]')
      .find('.app-nav__link')
      .first()
      .should('not.have.class', 'is-selected');
  });
});
