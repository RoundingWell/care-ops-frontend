context('App Header', function() {
  specify('The Header', function() {
    cy
      .server()
      .visit('/');
  });
});
