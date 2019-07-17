context('view page', function() {
  specify('view routing', function() {
    cy
      .server()
      .routeGroupActions()
      .visit('/view/owned-by-me')
      .wait('@routeGroupActions');
  });
});
