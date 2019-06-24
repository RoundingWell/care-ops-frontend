import { getIncluded } from 'helpers/json-api';

context('App Nav', function() {
  specify('display org and current clinician', function() {
    cy
      .server()
      .routeCurrentClinician(fx => {
        fx.data.attributes = {
          first_name: 'Clinician',
          last_name: 'McTester',
        };

        fx.data.relationships.organization.data.id = '1';

        fx.included = getIncluded(fx.included, {
          id: '1',
          name: 'Test Org Name',
        }, 'organizations');

        return fx;
      })
      .visit();

    cy
      .get('.app-nav__header')
      .should('contain', 'Test Org Name')
      .should('contain', 'Clinician McTester');
  });
});
