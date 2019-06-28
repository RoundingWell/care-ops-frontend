context('view page', function() {
  specify('view routing', function() {
    cy
      .server()
      .routeGroupActions()
      .visit('/view/1')
      .wait('@routeGroupActions');
  });
});
