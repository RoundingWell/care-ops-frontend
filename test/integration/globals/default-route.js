context('patient page', function() {
  specify('default route', function() {
    cy
      .server()
      .routePatient()
      .routePatientActions()
      .visit()
      .wait('@routeFlows');

    cy
      .url()
      .should('contain', 'worklist/owned-by');

    cy
      .get('.js-patient')
      .first()
      .click()
      .wait('@routePatient');

    cy
      .get('.patient__context-trail')
      .contains('Back to List')
      .click();

    cy
      .url()
      .should('contain', 'worklist/owned-by');
  });
});
