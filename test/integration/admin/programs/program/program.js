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

  specify('read only sidebar', function() {
    cy
      .server()
      .routeProgram(fx => {
        fx.data.id = '1';
        fx.data.attributes.name = 'Test Program';
        fx.data.attributes.details = null;
        fx.data.attributes.published = true;

        return fx;
      })
      .visit('/programs/1');

    cy
      .get('.program-sidebar')
      .should('contain', 'Test Program')
      .should('contain', 'No description given')
      .should('contain', 'On');

    cy
      .get('.js-menu')
      .click();

    cy
      .get('.picklist')
      .should('contain', 'Update Program')
      .should('contain', 'Edit');
  });
});
