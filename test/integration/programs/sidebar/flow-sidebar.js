import _ from 'underscore';

import formatDate from 'helpers/format-date';
import { testTs } from 'helpers/test-timestamp';

context('flow sidebar', function() {
  specify('display new flow sidebar', function() {
    cy
      .routeTags()
      .routeProgramActions(_.identity, '1')
      .routeProgramFlows(() => [])
      .routeProgram(fx => {
        fx.data.id = '1';
        return fx;
      })
      .routeProgramByProgramFlow()
      .routeProgramFlow()
      .routeProgramFlowActions()
      .visit('/program/1/flow')
      .wait('@routeProgramActions')
      .wait('@routeProgramFlows')
      .wait('@routeProgram');

    cy
      .get('.sidebar')
      .find('[data-name-region] .js-input')
      .should('be.focused')
      .should('have.attr', 'placeholder', 'New Program Flow');

    cy
      .get('.sidebar')
      .find('[data-save-region]')
      .contains('Save')
      .should('be.disabled');

    cy
      .get('.sidebar')
      .find('[data-published-region]')
      .contains('Draft')
      .should('be.disabled');

    cy
      .get('.sidebar')
      .find('[data-state-region]')
      .find('.is-disabled')
      .contains('To Do');

    cy
      .get('.sidebar')
      .find('[data-owner-region]')
      .contains('Select Team')
      .should('be.disabled');

    cy
      .get('.sidebar')
      .find('[data-tags-region]')
      .should('not.exist');

    cy
      .get('.sidebar')
      .find('[data-name-region] .js-input')
      .type('Test Name');

    cy
      .get('.sidebar')
      .find('[data-save-region]')
      .contains('Cancel')
      .click();

    cy
      .get('.sidebar')
      .should('not.exist');

    cy
      .get('.program__layout')
      .get('[data-add-region]')
      .contains('Add')
      .click();

    cy
      .get('.picklist')
      .contains('New Flow')
      .click();

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
      .should('be.empty')
      .type('a{backspace}')
      .type('Test{enter} Name');

    cy
      .get('.sidebar')
      .find('[data-details-region] .js-input')
      .type('a{backspace}')
      .type('Test{enter} Details');

    cy
      .route({
        status: 201,
        method: 'POST',
        url: '/api/programs/1/relationships/flows*',
        response: {
          data: {
            id: '1',
            attributes: {
              created_at: testTs(),
              updated_at: testTs(),
            },
          },
        },
      })
      .as('routePostFlow');

    cy
      .get('.sidebar')
      .find('[data-save-region]')
      .contains('Save')
      .click();

    cy
      .wait('@routeProgramByProgramFlow')
      .wait('@routeProgramFlow')
      .wait('@routeProgramFlowActions')
      .wait('@routePostFlow')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.owner.data).to.be.null;
        expect(data.id).to.not.be.null;
        expect(data.attributes.name).to.equal('Test Name');
        expect(data.attributes.details).to.equal('Test\n Details');
        expect(data.attributes.status).to.equal('draft');
      });

    cy
      .url()
      .should('contain', 'program-flow/1');
  });

  specify('display flow sidebar', function() {
    cy
      .routeTags()
      .routeProgramByProgramFlow()
      .routeProgramFlow(fx => {
        fx.data.id = '1';

        fx.data.attributes.name = 'Test Flow';
        fx.data.attributes.details = '';
        fx.data.attributes.status = 'draft';
        fx.data.attributes.created_at = testTs();
        fx.data.attributes.updated_at = testTs();
        fx.data.relationships.program.data.id = '1';

        _.each(fx.data.relationships['program-actions'].data, (programFlowAction, index) => {
          programFlowAction.id = `${ index + 1 }`;
        });

        return fx;
      })
      .routeProgramFlowActions(fx => {
        _.each(fx.data, (programFlowAction, index) => {
          programFlowAction.id = `${ index + 1 }`;
        });

        return fx;
      })
      .visit('/program-flow/1')
      .wait('@routeProgramByProgramFlow')
      .wait('@routeProgramFlow')
      .wait('@routeProgramFlowActions');

    cy
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/program-flows/1',
        response: {},
      })
      .as('routePatchFlow');

    cy
      .get('.js-flow')
      .as('flowHeader')
      .click('right')
      .should('have.class', 'is-selected');

    cy
      .get('.sidebar')
      .as('flowSidebar')
      .find('.js-close')
      .click();

    cy
      .get('@flowSidebar')
      .should('not.exist');

    cy
      .get('@flowHeader')
      .click('right');

    cy
      .get('[data-save-region]')
      .should('be.empty');

    cy
      .get('@flowSidebar')
      .find('[data-name-region] .js-input')
      .clear()
      .type('cancel this text');

    cy
      .get('@flowSidebar')
      .find('[data-save-region] .js-cancel')
      .type('{enter}', { force: true });

    cy
      .get('@flowSidebar')
      .find('[data-name-region] .js-input')
      .should('have.value', 'Test Flow');

    cy
      .get('@flowSidebar')
      .find('[data-save-region]')
      .should('be.empty');

    cy
      .get('@flowSidebar')
      .find('[data-name-region] .js-input')
      .clear()
      .type('Tester{enter} McFlowton');

    cy
      .get('@flowSidebar')
      .find('[data-details-region] textarea')
      .type('Here are some details')
      .tab()
      .should('have.class', 'js-save')
      .typeEnter();

    cy
      .wait('@routePatchFlow')
      .its('request.body')
      .should(({ data }) => {
        expect(data.id).to.not.be.null;
        expect(data.attributes.name).to.equal('Tester McFlowton');
        expect(data.attributes.details).to.equal('Here are some details');
      });

    cy
      .get('@flowHeader')
      .should('contain', 'Here are some details');

    cy
      .get('@flowSidebar')
      .find('[data-published-region] button')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('Published')
      .click();

    cy
      .wait('@routePatchFlow')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.status).to.equal('published');
      });

    cy
      .get('@flowHeader')
      .find('[data-published-region]');

    cy
      .get('@flowSidebar')
      .find('[data-owner-region] button')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('Nurse')
      .click();

    cy
      .wait('@routePatchFlow')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.owner.data.id).to.equal('22222');
        expect(data.relationships.owner.data.type).to.equal('teams');
      });

    cy
      .get('@flowHeader')
      .find('[data-owner-region]')
      .contains('NUR');

    cy
      .get('[data-state-region]')
      .trigger('pointerover');

    cy
      .get('.tooltip')
      .contains('Program Flows are set to To Do by default.');

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

    cy
      .get('@flowSidebar')
      .find('.js-menu')
      .click();

    cy
      .get('.picklist')
      .contains('Delete Program Flow')
      .click();

    cy
      .route({
        status: 403,
        method: 'DELETE',
        url: '/api/program-flows/1',
        response: {
          errors: [
            {
              id: '1',
              status: 403,
              title: 'Forbidden',
              detail: 'Insufficient permissions to delete action',
            },
          ],
        },
      })
      .as('routeDeleteFlowFailure');

    cy
      .get('.modal--small')
      .should('contain', 'Confirm Delete')
      .should('contain', 'Are you sure you want to delete this Program Flow? This cannot be undone.')
      .find('.js-submit')
      .click();

    cy
      .wait('@routeDeleteFlowFailure');

    cy
      .get('.alert-box')
      .should('contain', 'Insufficient permissions to delete action');

    cy
      .get('@flowSidebar')
      .find('.js-menu')
      .click();

    cy
      .get('.picklist')
      .contains('Delete Program Flow')
      .click();

    cy
      .route({
        status: 204,
        method: 'DELETE',
        url: '/api/program-flows/1',
        response: {},
      })
      .as('routeDeleteFlow');

    cy
      .route({
        url: '/api/programs/1',
        status: 404,
        response: {
          errors: [{
            id: '1',
            status: '404',
            title: 'Not Found',
            detail: 'Cannot find program',
            source: { parameter: 'programId' },
          }],
        },
      })
      .as('routeProgram');

    cy
      .get('.modal--small')
      .find('.js-submit')
      .click();

    cy
      .wait('@routeDeleteFlow')
      .itsUrl()
      .its('pathname')
      .should('contain', 'api/program-flows/1');

    cy
      .url()
      .should('contain', 'program/1');
  });

  specify('admin tags', function() {
    cy
      .routeTags()
      .routeProgramByProgramFlow()
      .routeCurrentClinician(fx => {
        fx.data.relationships.role.data.id = '22222';
        return fx;
      })
      .routeProgramFlow(fx => {
        fx.data.id = '1';
        fx.data.attributes.tags = ['test-tag'];

        return fx;
      })
      .routeProgramFlowActions()
      .visit('/program-flow/1')
      .wait('@routeProgramFlowActions')
      .wait('@routeProgramFlow');

    cy
      .get('.js-flow')
      .as('flowHeader')
      .click('right');

    cy
      .intercept({
        method: 'PATCH',
        url: 'api/program-flows/1',
      }, { statusCode: 204 })
      .as('routePatchFlow');

    cy
      .get('.sidebar')
      .find('[data-tags-region]')
      .contains('Add Tag')
      .click();

    cy
      .get('.picklist')
      .contains('foo-tag')
      .click()
      .wait('@routePatchFlow')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.tags).to.eql(['foo-tag', 'test-tag']);
      });

    cy
      .get('.sidebar')
      .find('[data-tags-region]')
      .should('contain', 'foo-tag')
      .should('contain', 'test-tag')
      .contains('Add Tag')
      .click();

    cy
      .get('.picklist')
      .should('contain', 'Want to add one?')
      .find('.js-input')
      .type('new-tag');

    cy
      .get('.picklist')
      .contains('Add new-tag')
      .click()
      .wait('@routePatchFlow')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.tags).to.eql(['foo-tag', 'new-tag', 'test-tag']);
      });

    cy
      .get('.sidebar')
      .find('[data-tags-region]')
      .should('contain', 'foo-tag')
      .should('contain', 'new-tag')
      .should('contain', 'test-tag')
      .find('.js-remove')
      .last()
      .click()
      .wait('@routePatchFlow')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.tags).to.eql(['foo-tag', 'new-tag']);
      });

    cy
      .get('.sidebar')
      .find('[data-tags-region]')
      .should('contain', 'foo-tag')
      .should('contain', 'new-tag')
      .should('not.contain', 'test-tag');
  });
});
