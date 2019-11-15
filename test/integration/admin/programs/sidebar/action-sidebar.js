import _ from 'underscore';
import moment from 'moment';

import formatDate from 'helpers/format-date';

const now = moment.utc();
const local = moment();

context('program action sidebar', function() {
  specify('display new action sidebar', function() {
    cy
      .server()
      .routeProgramActions(_.identity, '1')
      .routeProgram(fx => {
        fx.data.id = '1';
        return fx;
      })
      .routeProgramAction()
      .visit('/program/1/action')
      .wait('@routeProgramActions')
      .wait('@routeProgram');

    cy
      .get('.program-action-sidebar')
      .find('[data-name-region] .js-input')
      .should('be.focused')
      .should('have.attr', 'placeholder', 'New Program Action');

    cy
      .get('.program-action-sidebar')
      .find('[data-save-region]')
      .contains('Save')
      .should('be.disabled');

    cy
      .get('.program-action-sidebar')
      .find('[data-published-region]')
      .contains('Draft')
      .should('be.disabled');

    cy
      .get('.program-action-sidebar')
      .find('[data-state-region]')
      .find('.is-disabled')
      .contains('To Do');

    cy
      .get('.program-action-sidebar')
      .find('[data-owner-region]')
      .contains('Select Role')
      .should('be.disabled');

    cy
      .get('.program-action-sidebar')
      .find('[data-due-region]')
      .contains('Select # Days')
      .should('be.disabled');

    cy
      .get('.program-action-sidebar')
      .find('[data-name-region] .js-input')
      .type('Test Name');

    cy
      .get('.program-action-sidebar')
      .find('[data-save-region]')
      .contains('Cancel')
      .click();

    cy
      .get('.program-action-sidebar')
      .should('not.exist');

    cy
      .get('.js-add')
      .contains('Action')
      .click();

    cy
      .get('.program-action-sidebar')
      .find('[data-name-region] .js-input')
      .should('be.empty')
      .type('   ');

    cy
      .get('.program-action-sidebar')
      .find('[data-save-region]')
      .contains('Save')
      .should('be.disabled');

    cy
      .get('.program-action-sidebar')
      .find('[data-name-region] .js-input')
      .type('{backspace}{backspace}{backspace}');

    cy
      .get('.program-action-sidebar')
      .find('[data-name-region] .js-input')
      .should('be.empty')
      .type('a{backspace}')
      .type('Test{enter} Name');

    cy
      .get('.program-action-sidebar')
      .find('[data-details-region] .js-input')
      .type('a{backspace}')
      .type('Test{enter} Details');

    cy
      .route({
        status: 201,
        method: 'POST',
        url: '/api/programs/1/relationships/actions*',
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
      .as('routePostAction');

    cy
      .routeProgramAction(fx => {
        fx.data.id = '1';
        fx.data.attributes.created_at = local.format();
        fx.data.attributes.updated_at = local.format();
        return fx;
      });

    cy
      .get('.program-action-sidebar')
      .find('[data-save-region]')
      .contains('Save')
      .click();

    cy
      .wait('@routePostAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.role.data).to.be.null;
        expect(data.id).to.not.be.null;
        expect(data.attributes.name).to.equal('Test Name');
        expect(data.attributes.details).to.equal('Test\n Details');
        expect(data.attributes.status).to.equal('draft');
        expect(data.attributes.days_until_due).to.be.null;
      });

    cy
      .get('.program-action-sidebar')
      .find('[data-save-region]')
      .should('be.empty');

    cy
      .get('.program-action-sidebar__timestamps')
      .contains('Created')
      .next()
      .should('contain', formatDate(local, 'AT_TIME'));

    cy
      .get('.program-action-sidebar__timestamps')
      .contains('Last Updated')
      .next()
      .should('contain', formatDate(local, 'AT_TIME'));

    cy
      .get('.program-action-sidebar')
      .find('.js-menu')
      .click();

    cy
      .route({
        status: 204,
        method: 'DELETE',
        url: '/api/program-actions/1*',
        response: {},
      })
      .as('routeDeleteAction');

    cy
      .get('.picklist')
      .contains('Delete Action')
      .click();

    cy
      .wait('@routeDeleteAction')
      .its('url')
      .should('contain', 'api/program-actions/1');

    cy
      .get('.program-action-sidebar')
      .should('not.exist');
  });

  specify('display action sidebar', function() {
    const actionData = {
      id: '1',
      attributes: {
        name: 'Name',
        details: 'Details',
        status: 'published',
        days_until_due: 5,
        created_at: now.format(),
        updated_at: now.format(),
      },
      relationships: {
        role: { data: { id: '11111' } },
      },
    };

    cy
      .server()
      .routeProgramAction(fx => {
        fx.data = actionData;

        return fx;
      })
      .routeProgramActions(fx => {
        fx.data[0] = actionData;

        return fx;
      }, '1')
      .routeProgram()
      .visit('/program/1/action/1')
      .wait('@routeProgramActions')
      .wait('@routeProgramAction')
      .wait('@routeProgram');

    cy
      .get('.program-action-sidebar')
      .find('[data-save-region]')
      .should('be.empty');

    cy
      .get('.program-action-sidebar')
      .find('[data-name-region] .js-input')
      .clear();

    cy
      .get('.program-action-sidebar')
      .find('[data-save-region]')
      .contains('Save')
      .should('be.disabled');

    cy
      .get('.program-action-sidebar')
      .find('[data-name-region] .js-input')
      .type('testing name');

    cy
      .get('.program-action-sidebar')
      .find('[data-details-region] .js-input')
      .clear();

    cy
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/program-actions/1',
        response: {},
      })
      .as('routePatchAction');

    cy
      .get('.program-action-sidebar')
      .find('[data-save-region]')
      .contains('Save')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships).to.not.exist;
        expect(data.id).to.equal('1');
        expect(data.attributes.name).to.equal('testing name');
        expect(data.attributes.details).to.equal('');
        expect(data.attributes.status).to.not.exist;
        expect(data.attributes.days_until_due).to.not.exist;
      });

    cy
      .get('.program-action-sidebar')
      .find('[data-save-region]')
      .should('be.empty');

    cy
      .get('.program-action-sidebar')
      .find('[data-name-region] .js-input')
      .type('cancel this text');

    cy
      .get('.program-action-sidebar')
      .find('[data-save-region]')
      .contains('Cancel')
      .click();

    cy
      .get('.program-action-sidebar')
      .find('[data-name-region] .js-input')
      .should('have.value', 'testing name');

    cy
      .get('.program-action-sidebar')
      .find('[data-save-region]')
      .should('be.empty');

    cy
      .get('.program-action-sidebar')
      .find('[data-published-region]')
      .contains('Published')
      .click();

    cy
      .get('.picklist')
      .contains('Draft')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.status).to.equal('draft');
      });

    cy
      .get('.program-action-sidebar')
      .find('[data-state-region]')
      .contains('To Do')
      .as('stateButton')
      .trigger('mouseover');

    cy
      .get('.tooltip')
      .contains('set to To Do by default');

    cy
      .get('@stateButton')
      .trigger('mouseout');

    cy
      .get('.program-action-sidebar')
      .find('[data-owner-region]')
      .contains('Coordinator')
      .click();

    cy
      .get('.picklist')
      .contains('Nurse')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.role.data.id).to.equal('22222');
      });

    cy
      .get('.program-action-sidebar')
      .find('[data-owner-region]')
      .contains('Nurse');

    cy
      .get('.program-action-sidebar')
      .find('[data-due-region]')
      .contains('5 days')
      .click();

    cy
      .get('.picklist')
      .contains('Same Day')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.days_until_due).to.equal(0);
      });

    cy
      .get('.program-action-sidebar')
      .find('[data-due-region]')
      .contains('Same Day')
      .click();

    cy
      .get('.picklist')
      .contains('Clear Selection')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.days_until_due).to.be.null;
      });

    cy
      .route({
        status: 200,
        method: 'POST',
        url: '/api/program-actions/1/relationships/forms',
        response: {},
      })
      .as('routeAddAttachment');

    cy
      .get('.program-action-sidebar')
      .find('[data-attachment-region]')
      .contains('Add Attachment...')
      .click();

    cy
      .get('.picklist')
      .contains('Test Form')
      .click();

    cy
      .wait('@routeAddAttachment')
      .its('request.body')
      .should(({ data }) => {
        expect(data[0].id).to.equal('11111');
      });

    cy
      .route({
        status: 204,
        method: 'DELETE',
        url: '/api/program-actions/1/relationships/forms',
        response: {},
      })
      .as('routeDeleteAttachment');

    cy
      .get('.program-action-sidebar')
      .find('[data-attachment-region]')
      .find('.js-delete')
      .click();

    cy
      .wait('@routeDeleteAttachment')
      .its('request.body')
      .should(({ data }) => {
        expect(data[0].id).to.equal('11111');
      });

    cy
      .get('.program-action-sidebar')
      .find('[data-attachment-region]')
      .should('contain', 'Add Attachment...');

    cy
      .get('.program-action-sidebar__timestamps')
      .contains('Created')
      .next()
      .should('contain', formatDate(local, 'AT_TIME'));

    cy
      .get('.program-action-sidebar__timestamps')
      .contains('Last Updated')
      .next()
      .should('contain', formatDate(local, 'AT_TIME'));
  });

  specify('display action sidebar with no org forms', function() {
    cy
      .server()
      .routeProgramAction()
      .routeProgramActions()
      .routeProgram()
      .routeForms(fx => {
        fx.data = [];

        return fx;
      })
      .visit('/program/1/action/1')
      .wait('@routeProgramActions')
      .wait('@routeProgramAction')
      .wait('@routeProgram');

    cy
      .get('.program-action-sidebar')
      .find('[data-attachment-region]')
      .contains('Add Attachment...')
      .click();

    cy
      .get('.picklist')
      .should('contain', 'No Available Forms');
  });

  specify('deleted action', function() {
    cy
      .server()
      .routeProgram()
      .routeProgramActions(_.identity, '1')
      .route({
        url: '/api/program-actions/1',
        status: 404,
        response: {
          errors: [{
            id: '1',
            status: '404',
            title: 'Not Found',
            detail: 'Cannot find action',
            source: { parameter: 'actionId' },
          }],
        },
      })
      .as('routeProgramAction')
      .visit('/program/1/action/1')
      .wait('@routeProgram')
      .wait('@routeProgramActions')
      .wait('@routeProgramAction');

    cy
      .get('.alert-box__body')
      .should('contain', 'The Action you requested does not exist.');

    cy
      .get('.program-action-sidebar')
      .should('not.exist');
  });
});
