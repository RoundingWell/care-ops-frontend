import _ from 'underscore';
import moment from 'moment';

import formatDate from 'helpers/format-date';

const now = moment.utc();
const local = moment();

context('flow sidebar', function() {
  specify('display new flow sidebar', function() {
    cy
      .server()
      .routeProgramActions(_.identity, '1')
      .routeProgramFlows(() => [])
      .routeProgram(fx => {
        fx.data.id = '1';
        return fx;
      })
      .visit('/program/1/flow')
      .wait('@routeProgramActions')
      .wait('@routeProgramFlows')
      .wait('@routeProgram');

    cy
      .get('.program-flow-sidebar')
      .find('[data-name-region] .js-input')
      .should('be.focused')
      .should('have.attr', 'placeholder', 'New Program Flow');

    cy
      .get('.program-flow-sidebar')
      .find('[data-save-region]')
      .contains('Save')
      .should('be.disabled');

    cy
      .get('.program-flow-sidebar')
      .find('[data-published-region]')
      .contains('Draft')
      .should('be.disabled');

    cy
      .get('.program-flow-sidebar')
      .find('[data-state-region]')
      .find('.is-disabled')
      .contains('To Do');

    cy
      .get('.program-flow-sidebar')
      .find('[data-owner-region]')
      .contains('Select Role')
      .should('be.disabled');

    cy
      .get('.program-flow-sidebar')
      .find('[data-name-region] .js-input')
      .type('Test Name');

    cy
      .get('.program-flow-sidebar')
      .find('[data-save-region]')
      .contains('Cancel')
      .click();

    cy
      .get('.program-flow-sidebar')
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
      .get('.program-flow-sidebar')
      .find('[data-name-region] .js-input')
      .should('be.empty')
      .type('   ');

    cy
      .get('.program-flow-sidebar')
      .find('[data-save-region]')
      .contains('Save')
      .should('be.disabled');

    cy
      .get('.program-flow-sidebar')
      .find('[data-name-region] .js-input')
      .type('{backspace}{backspace}{backspace}');

    cy
      .get('.program-flow-sidebar')
      .find('[data-name-region] .js-input')
      .should('be.empty')
      .type('a{backspace}')
      .type('Test{enter} Name');

    cy
      .get('.program-flow-sidebar')
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
              created_at: now.format(),
              updated_at: now.format(),
            },
          },
        },
      })
      .as('routePostFlow');

    cy
      .get('.program-flow-sidebar')
      .find('[data-save-region]')
      .contains('Save')
      .click();

    cy
      .wait('@routePostFlow')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.role.data).to.be.null;
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
      .server()
      .routeProgramByFlow()
      .routeProgramFlow(fx => {
        fx.data.id = '1';

        fx.data.attributes.name = 'Test Flow';
        fx.data.attributes.details = '';
        fx.data.attributes.status = 'draft';
        fx.data.attributes.created_at = now.format();
        fx.data.attributes.updated_at = now.format();
        fx.data.relationships.program.data.id = '1';

        _.each(fx.data.relationships['program-flow-actions'].data, (programFlowAction, index) => {
          programFlowAction.id = index + 1;
        });

        return fx;
      })
      .routeProgramFlowActions(fx => {
        _.each(fx.data, (programFlowAction, index) => {
          programFlowAction.id = index + 1;
        });

        return fx;
      }, '1')
      .visit('/program-flow/1')
      .wait('@routeProgramByFlow')
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
      .click()
      .should('have.class', 'is-selected');

    cy
      .get('.program-flow-sidebar')
      .as('flowSidebar')
      .find('.js-close')
      .click();

    cy
      .get('@flowSidebar')
      .should('not.exist');

    cy
      .get('@flowHeader')
      .click();

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
      .find('[data-save-region]')
      .contains('Cancel')
      .click();

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
      .type('Here are some details');

    cy
      .get('[data-save-region]')
      .contains('Save')
      .click();

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
      .find('.picklist__item')
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
      .find('.picklist__item')
      .contains('Nurse')
      .click();

    cy
      .wait('@routePatchFlow')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.role.data.id).to.equal('22222');
      });

    cy
      .get('@flowHeader')
      .find('[data-owner-region]')
      .contains('NUR');

    cy
      .get('[data-state-region]')
      .trigger('mouseover');

    cy
      .get('.tooltip')
      .contains('Program Flows are set to To Do by default.');

    cy
      .get('.program-flow-sidebar__timestamps')
      .contains('Created')
      .next()
      .should('contain', formatDate(local, 'AT_TIME'));

    cy
      .get('.program-flow-sidebar__timestamps')
      .contains('Last Updated')
      .next()
      .should('contain', formatDate(local, 'AT_TIME'));

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
      .get('.modal--small')
      .should('contain', 'Confirm Delete')
      .should('contain', 'Are you sure you want to delete this Program Flow? This cannot be undone.')
      .find('.js-submit')
      .click();

    cy
      .wait('@routeDeleteFlow')
      .its('url')
      .should('contain', 'api/program-flows/1');

    cy
      .url()
      .should('contain', 'program/1');
  });
});


