import _ from 'underscore';
import moment from 'moment';

import formatDate from 'helpers/format-date';

import { getError } from 'helpers/json-api';

const stateColors = Cypress.env('stateColors');
const now = moment.utc();
const local = moment();

context('program sidebar', function() {
  specify('display new program sidebar', function() {
    cy
      .server()
      .routePrograms()
      .visit('/programs')
      .wait('@routePrograms');

    cy
      .get('.js-add')
      .contains('Program')
      .click();

    cy
      .get('.program-sidebar')
      .find('[data-name-region] .js-input')
      .should('be.focused')
      .should('have.attr', 'placeholder', 'New Program');

    cy
      .get('.program-sidebar')
      .find('[data-save-region]')
      .contains('Save')
      .should('be.disabled');

    cy
      .get('.program-sidebar')
      .find('[data-name-region] .js-input')
      .type('Test Program');

    cy
      .get('.program-sidebar')
      .find('[data-save-region]')
      .contains('Cancel')
      .click();

    cy
      .get('.program-sidebar')
      .should('not.exist');

    cy
      .get('.js-add')
      .contains('Program')
      .click();

    const errors = _.map({ name: 'name error' }, getError);

    cy
      .route({
        method: 'POST',
        url: '/api/programs',
        response: { errors },
        delay: 100,
        status: 400,
      }).as('routePostProgramError');

    cy
      .get('.program-sidebar')
      .find('[data-name-region] .js-input')
      .should('be.empty')
      .type('a{backspace}')
      .type('Test{enter} Program Name');

    cy
      .get('.program-sidebar')
      .find('[data-save-region]')
      .contains('Save')
      .click()
      .wait('@routePostProgramError');

    cy
      .get('.program-sidebar')
      .find('[data-name-region]')
      .should('contain', 'name error')
      .find('.js-input')
      .should('have.css', 'border-color', stateColors.error);

    cy
      .get('.program-sidebar')
      .find('[data-save-region]')
      .contains('Save')
      .should('be.disabled');

    cy
      .get('.program-sidebar')
      .find('[data-details-region] .js-input')
      .type('a{backspace}')
      .type('Test{enter} Details');

    cy
      .route({
        status: 201,
        method: 'POST',
        url: '/api/programs',
        response: {
          data: {
            id: '1',
            attributes: {
              name: 'Test Program Name',
              published: false,
              updated_at: now.format(),
              created_at: now.format(),
            },
          },
        },
      })
      .as('routePostProgram');

    cy
      .get('.program-sidebar')
      .find('[data-save-region]')
      .contains('Save')
      .click();

    cy
      .wait('@routePostProgram')
      .its('request.body')
      .should(({ data }) => {
        expect(data.id).to.not.be.null;
        expect(data.attributes.name).to.equal('Test Program Name');
        expect(data.attributes.details).to.equal('Test\n Details');
      });

    cy
      .get('program-sidebar')
      .should('not.exist');

    cy
      .get('.table-list__item')
      .first()
      .should('contain', 'Test Program Name')
      .should('contain', formatDate(local, 'TIME_OR_DAY'));

    cy
      .get('.js-add')
      .contains('Program')
      .click();

    cy
      .get('.js-menu')
      .click();

    cy
      .get('.picklist')
      .should('contain', 'Delete Program')
      .click();

    cy
      .get('program-sidebar')
      .should('not.exist');
  });
});
