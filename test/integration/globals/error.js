context('Global Error Page', function() {
  specify('Displaying and navigating the global error page', function() {
    cy
      .visit('/');

    cy
      .window()
      .should('have.property', 'Backbone')
      .then(Backbone => {
        Backbone.history.navigate('404', { trigger: true });
      });

    cy
      .get('.error-page')
      .should('contain', 'Something went wrong.')
      .and('contain', ' This page doesn\'t exist.');

    cy
      .get('.error-page')
      .contains('Back to Previous Page')
      .click();

    cy
      .url()
      .should('not.contain', '404');
  });
});
