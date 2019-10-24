import moment from 'moment';

import formatDate from 'helpers/format-date';

const local = moment();
const now = moment.utc();

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

  specify('read only sidebar and edit sidebar', function() {
    cy
      .server()
      .routeProgram(fx => {
        fx.data.id = '1';
        fx.data.attributes.name = 'Test Program';
        fx.data.attributes.details = null;
        fx.data.attributes.published = true;
        fx.data.attributes.created_at = now.format();
        fx.data.attributes.updated_at = now.format();

        return fx;
      })
      .visit('/program/1');

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
      .should('contain', 'Edit')
      .click();

    cy
      .get('[data-save-region]')
      .should('be.empty');

    cy
      .get('.programs-sidebar')
      .find('[data-name-region] .js-input')
      .type('Tester McProgramington');

    cy
      .get('[data-save-region]')
      .should('not.be.empty');

    cy
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/programs/1',
        response: {},
      })
      .as('routePatchProgram');

    cy
      .get('.js-state-toggle')
      .should('contain', 'Turn Off')
      .click();

    cy
      .wait('@routePatchProgram')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.published).to.be.false;
      });

    cy
      .get('.programs-sidebar__state')
      .find('.programs-sidebar__item')
      .should('contain', 'Off');


    cy
      .get('.programs-sidebar__timestamps')
      .contains('Created')
      .next()
      .should('contain', formatDate(local, 'AT_TIME'));

    cy
      .get('.programs-sidebar__timestamps')
      .contains('Last Updated')
      .next()
      .should('contain', formatDate(local, 'AT_TIME'));
  });
});
