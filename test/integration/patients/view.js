context('view page', function() {
  specify('view routing', function() {
    cy
      .server()
      .routeGroupActions()
      .visit('/view/assigned-to-me')
      .wait('@routeGroupActions');
  });
});
