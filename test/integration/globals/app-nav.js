context('App Nav', function() {
  specify('display nav', function() {
    cy
      .server()
      .routeGroupActions()
      .routeCurrentClinician(fx => {
        fx.data.attributes = {
          first_name: 'Clinician',
          last_name: 'McTester',
        };

        return fx;
      })
      .visit();

    cy
      .get('.app-nav__header')
      .should('contain', 'Test Org Name')
      .should('contain', 'Clinician McTester');

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
