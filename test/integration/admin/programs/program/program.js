import moment from 'moment';

context('program page', function() {
  specify('context trail', function() {
    cy
      .server()
      .routePrograms(fx => {
        fx.data[0].id = '1';

        fx.data[0].attributes.name = 'Test Program';
        fx.data[0].attributes.updated_at = moment().utc().format();

        return fx;
      })
      .routeProgram(fx => {
        fx.data.id = '1';
        fx.data.attributes.name = 'Test Program';

        return fx;
      })
      .visit('/programs');

    cy
      .get('.table-list__item')
      .contains('Test Program')
      .click();

    cy
      .url()
      .should('contain', 'programs/1');

    cy
      .get('.program__context-trail')
      .should('contain', 'Test Program')
      .contains('Back to List')
      .click();

    cy
      .url()
      .should('contain', 'programs');
  });
});
