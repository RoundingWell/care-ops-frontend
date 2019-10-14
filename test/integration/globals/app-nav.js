context('App Nav', function() {
  specify('display nav', function() {
    let logoutStub;
    cy
      .server()
      .routeGroupActions()
      .routePrograms()
      .visit();

    cy
      .getRadio(Radio => {
        logoutStub = cy.stub();
        Radio.reply('auth', 'logout', logoutStub);
      });

    cy
      .get('.app-nav__header')
      .should('contain', 'Cypress Clinic')
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
      .get('.app-nav__header')
      .click();

    cy
      .get('.picklist')
      .contains('Admin')
      .click();

    cy
      .url()
      .should('contain', 'programs');

    cy
      .get('.app-nav__header')
      .click();

    cy
      .get('.picklist')
      .contains('Your Workspace')
      .click();

    cy
      .url()
      .should('contain', 'patients/all');

    cy
      .get('[data-nav-region]')
      .find('[data-views-region]')
      .as('views');

    cy
      .get('@views')
      .find('.app-nav__link')
      .first()
      .click()
      .should('have.class', 'is-selected');

    cy
      .get('@views')
      .find('.app-nav__link')
      .last()
      .click()
      .should('have.class', 'is-selected');

    cy
      .get('@views')
      .find('.app-nav__link')
      .first()
      .should('not.have.class', 'is-selected');
  });
});
