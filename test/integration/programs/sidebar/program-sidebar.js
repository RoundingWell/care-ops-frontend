import _ from 'underscore';

import formatDate from 'helpers/format-date';

import { getError } from 'helpers/json-api';
import { testTs } from 'helpers/test-timestamp';
import stateColors from 'helpers/state-colors';

context('program sidebar', function() {
  specify('display new program sidebar', function() {
    cy
      .routePrograms()
      .visit('/programs')
      .wait('@routePrograms');

    cy
      .get('.js-add')
      .contains('Program')
      .click();

    cy
      .get('.sidebar')
      .find('[data-name-region] .js-input')
      .should('be.focused')
      .should('have.attr', 'placeholder', 'New Program');

    cy
      .get('.sidebar')
      .find('[data-save-region]')
      .contains('Save')
      .should('be.disabled');

    cy
      .get('.sidebar')
      .find('[data-name-region] .js-input')
      .should('be.empty')
      .type('   ');

    cy
      .get('.sidebar')
      .find('[data-save-region]')
      .contains('Save')
      .should('be.disabled');

    cy
      .get('.sidebar')
      .find('[data-name-region] .js-input')
      .type('{backspace}{backspace}{backspace}');

    cy
      .get('.sidebar')
      .find('[data-name-region] .js-input')
      .type('Test Program');

    cy
      .get('.sidebar')
      .find('[data-save-region]')
      .contains('Cancel')
      .click();

    cy
      .get('.sidebar')
      .should('not.exist');

    cy
      .get('.js-add')
      .contains('Program')
      .click();

    const errors = _.map({ name: 'name error' }, getError);

    cy
      .intercept('POST', '/api/programs', {
        statusCode: 400,
        delay: 100,
        body: { errors },
      })
      .as('routePostProgramError');

    cy
      .get('.sidebar')
      .find('[data-name-region] .js-input')
      .should('be.empty')
      .type('a{backspace}')
      .type('Test{enter} Program Name');

    cy
      .get('.sidebar')
      .find('[data-save-region]')
      .contains('Save')
      .click()
      .wait('@routePostProgramError');

    cy
      .get('.sidebar')
      .find('[data-name-region]')
      .should('contain', 'name error')
      .find('.js-input')
      .should('have.css', 'border-top-color', stateColors.error);

    cy
      .get('.sidebar')
      .find('[data-save-region]')
      .contains('Save')
      .should('be.disabled');

    cy
      .get('.sidebar')
      .find('[data-details-region] .js-input')
      .type('a{backspace}')
      .type('Test{enter} Details');

    cy
      .intercept('POST', '/api/programs', {
        statusCode: 201,
        body: {
          data: {
            id: '1',
            attributes: {
              name: 'Test Program Name',
              published: false,
              updated_at: testTs(),
              created_at: testTs(),
            },
          },
        },
      })
      .as('routePostProgram');

    cy
      .get('.sidebar')
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
      .get('.sidebar')
      .should('not.exist');

    cy
      .get('.table-list__item')
      .first()
      .should('contain', 'Test Program Name')
      .should('contain', formatDate(testTs(), 'TIME_OR_DAY'));

    cy
      .get('.js-add')
      .contains('Program')
      .click();
  });

  specify('display program sidebar', function() {
    const programData = {
      id: '1',
      attributes: {
        name: 'Name',
        details: '',
        published: false,
        created_at: testTs(),
        updated_at: testTs(),
      },
    };

    cy
      .routeProgram(fx => {
        fx.data = programData;

        return fx;
      })
      .routeProgramActions(_.identity, '1')
      .routeProgramFlows()
      .visit('/program/1')
      .wait('@routeProgram');

    cy
      .intercept('PATCH', '/api/programs/1', {
        statusCode: 204,
        body: {},
      })
      .as('routePatchProgram');

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
      .get('.sidebar')
      .find('[data-name-region] .js-input')
      .clear()
      .type('cancel this text')
      .tab()
      .tab()
      .tab()
      .should('have.class', 'js-cancel')
      .typeEnter();

    cy
      .get('.js-state-toggle')
      .should('contain', 'Turn On')
      .click()
      .wait('@routePatchProgram');

    cy
      .get('.sidebar')
      .find('[data-name-region] .js-input')
      .should('have.value', 'Name');

    cy
      .get('.sidebar')
      .find('[data-save-region]')
      .should('be.empty');

    cy
      .get('.sidebar')
      .find('[data-name-region] .js-input')
      .clear()
      .type('Tester McProgramington')
      .tab()
      .tab()
      .should('have.class', 'js-save')
      .typeEnter();

    cy
      .wait('@routePatchProgram')
      .its('request.body')
      .should(({ data }) => {
        expect(data.id).to.equal('1');
        expect(data.attributes.name).to.equal('Tester McProgramington');
        expect(data.attributes.details).to.equal('');
        expect(data.attributes.published).to.be.undefined;
      });

    cy
      .get('.sidebar')
      .find('[data-save-region]')
      .should('be.empty');

    cy
      .get('.sidebar')
      .contains('Program State')
      .next()
      .should('contain', 'On');

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
      .get('.sidebar')
      .contains('Program State')
      .next()
      .should('contain', 'Off');

    cy
      .get('.js-state-toggle')
      .should('contain', 'Turn On');

    cy
      .get('.sidebar__footer')
      .contains('Added')
      .next()
      .should('contain', formatDate(testTs(), 'AT_TIME'));

    cy
      .get('.sidebar__footer')
      .contains('Updated')
      .next()
      .should('contain', formatDate(testTs(), 'AT_TIME'));
  });
});
