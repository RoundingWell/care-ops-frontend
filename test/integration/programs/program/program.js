import { testTs } from 'helpers/test-timestamp';

context('program page', function() {
  specify('context trail', function() {
    cy
      .routePrograms(fx => {
        fx.data[0].id = '1';

        fx.data[0].attributes.name = 'Test Program';
        fx.data[0].attributes.updated_at = testTs();

        return fx;
      })
      .routeProgram(fx => {
        fx.data.id = '1';
        fx.data.attributes.name = 'Test Program';

        return fx;
      })
      .routeProgramActions()
      .routeProgramFlows()
      .visit('/programs');

    cy
      .get('.table-list__item')
      .contains('Test Program')
      .click();

    cy
      .url()
      .should('contain', 'program/1');

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
      .routeProgram(fx => {
        fx.data.id = '1';
        fx.data.attributes.name = 'Test Program';
        fx.data.attributes.details = null;
        fx.data.attributes.published = true;
        fx.data.attributes.created_at = testTs();
        fx.data.attributes.updated_at = testTs();

        return fx;
      })
      .routeProgramFlows()
      .routeProgramActions()
      .visit('/program/1');

    cy
      .intercept('PATCH', '/api/programs/1', {
        statusCode: 204,
        body: {},
      })
      .as('routePatchProgram');

    cy
      .get('.program-sidebar')
      .should('contain', 'Test Program')
      .should('contain', 'No details given')
      .should('contain', 'On');

    cy
      .get('.js-menu')
      .click();

    cy
      .get('.picklist')
      .should('contain', 'Update Program')
      .should('contain', 'Edit')
      .click();

    cy
      .get('.sidebar')
      .find('[data-name-region]')
      .contains('Test Program')
      .clear()
      .type('Testing');

    cy
      .get('[data-save-region]')
      .contains('Save')
      .click();

    cy
      .get('.program__context-trail')
      .should('contain', 'Testing');
  });

  specify('new flow sidebar', function() {
    cy
      .routeTags()
      .routeProgram(fx => {
        fx.data.id = '1';

        return fx;
      })
      .routeProgramActions(fx => [])
      .routeProgramFlows(fx => [])
      .visit('/program/1')
      .wait('@routeProgram')
      .wait('@routeProgramActions')
      .wait('@routeProgramFlows');

    cy
      .get('[data-add-region]')
      .contains('Add')
      .click();

    cy
      .get('.picklist')
      .contains('New Flow')
      .click();

    cy
      .get('.sidebar');
  });
});
