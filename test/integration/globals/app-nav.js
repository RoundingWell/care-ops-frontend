context('App Nav', function() {
  specify('selecting a nav item', function() {
    cy
      .server()
      .visit('/');
  });
});
