context('App Nav', function() {
  specify('display non-manager nav', function() {
    cy
      .server()
      .routeCurrentClinician(fx => {
        fx.data.id = '123456';
        fx.data.attributes.access = 'not-manager';
        return fx;
      })
      .routeGroupActions()
      .routePrograms()
      .visit();

    cy
      .get('.app-nav__header')
      .click();

    cy
      .get('.picklist')
      .should('not.contain', 'Your Workspace')
      .should('not.contain', 'Admin')
      .should('contain', 'Sign Out');
  });

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
      .as('mainNav')
      .click();

    cy
      .get('.picklist')
      .find('.is-selected')
      .should('contain', 'Your Workspace');

    cy
      .get('.picklist')
      .contains('Admin')
      .click();

    cy
      .url()
      .should('contain', 'programs');

    cy
      .get('[data-nav-content-region]')
      .contains('Programs')
      .should('have.class', 'is-selected');

    cy
      .get('@mainNav')
      .click();

    cy
      .get('.picklist')
      .contains('Your Workspace')
      .click();

    cy
      .url()
      .should('contain', 'patients/all');

    cy
      .get('[data-nav-content-region]')
      .find('[data-worklists-region]')
      .as('worklists');

    cy
      .get('@worklists')
      .find('.app-nav__link')
      .first()
      .click()
      .should('have.class', 'is-selected');

    cy
      .get('@worklists')
      .find('.app-nav__link')
      .last()
      .click()
      .should('have.class', 'is-selected');

    cy
      .get('@worklists')
      .find('.app-nav__link')
      .first()
      .should('not.have.class', 'is-selected');

    cy
      .get('@mainNav')
      .click();

    cy
      .get('.picklist')
      .contains('Sign Out')
      .click()
      .then(() => {
        expect(logoutStub).to.have.been.calledOnce;
      });
  });
});
