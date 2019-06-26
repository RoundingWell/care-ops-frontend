context('patient context trail', function() {
  specify('display and back to list', function() {
    cy
      .server()
      .routePatient(fx => {
        fx.data.attributes.first_name = 'First';
        fx.data.attributes.last_name = 'Last';

        return fx;
      })
      .visit('/patient/dashboard/1')
      .wait('@routePatient');

    cy
      .get('[data-context-trail-region]')
      .should('contain', 'First Last')
      .should('not.contain', 'Back to List');

    cy
      .get('.app-nav')
      .contains('All Patients')
      .click();

    cy
      .go('back');

    cy
      .get('[data-context-trail-region]')
      .should('contain', 'First Last')
      .contains('Back to List')
      .click();

    cy
      .url()
      .should('contain', 'patients/all');
  });
});
