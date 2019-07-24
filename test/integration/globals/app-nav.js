context('App Nav', function() {
  specify('display org and current clinician', function() {
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
  });
});
