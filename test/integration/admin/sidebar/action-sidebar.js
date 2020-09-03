import _ from 'underscore';

import formatDate from 'helpers/format-date';
import { testTs } from 'helpers/test-moment';

context('program action sidebar', function() {
  specify('display new action sidebar', function() {
    cy
      .server()
      .routeProgramActions(_.identity, '1')
      .routeProgramFlows(() => [])
      .routeProgram(fx => {
        fx.data.id = '1';
        return fx;
      })
      .routeProgramAction()
      .visit('/program/1/action')
      .wait('@routeProgramActions')
      .wait('@routeProgramFlows')
      .wait('@routeProgram');

    cy
      .get('.sidebar')
      .find('[data-name-region] .js-input')
      .should('be.focused')
      .should('have.attr', 'placeholder', 'New Program Action');

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
      .contains('Select Role')
      .should('be.disabled');

    cy
      .get('.sidebar')
      .find('[data-due-region]')
      .contains('Select # Days')
      .should('be.disabled');

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
      .contains('New Action')
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
        url: '/api/program-actions',
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
      .as('routePostAction');

    cy
      .routeProgramAction(fx => {
        fx.data.id = '1';
        fx.data.attributes.name = 'Test Name';
        fx.data.attributes.created_at = testTs();
        fx.data.attributes.updated_at = testTs();
        return fx;
      });

    cy
      .get('.sidebar')
      .find('[data-save-region]')
      .contains('Save')
      .click();

    cy
      .wait('@routePostAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.owner.data).to.be.null;
        expect(data.id).to.not.be.null;
        expect(data.attributes.name).to.equal('Test Name');
        expect(data.attributes.details).to.equal('Test\n Details');
        expect(data.attributes.status).to.equal('draft');
        expect(data.attributes.days_until_due).to.be.null;
      });

    cy
      .get('.sidebar')
      .find('[data-save-region]')
      .should('be.empty');

    cy
      .get('.sidebar__footer')
      .contains('Created')
      .next()
      .should('contain', formatDate(testTs(), 'AT_TIME'));

    cy
      .get('.sidebar__footer')
      .contains('Last Updated')
      .next()
      .should('contain', formatDate(testTs(), 'AT_TIME'));

    cy
      .get('.sidebar')
      .find('.js-menu')
      .click();

    cy
      .route({
        status: 403,
        method: 'DELETE',
        url: '/api/program-actions/1*',
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
      .as('routeDeleteActionFail');

    cy
      .get('.picklist')
      .contains('Delete Program Action')
      .click();

    cy
      .wait('@routeDeleteActionFail');

    cy
      .get('.alert-box')
      .should('contain', 'Insufficient permissions to delete action');

    cy
      .get('.workflows__list')
      .find('.table-list__item')
      .contains('Test Name');

    cy
      .route({
        status: 204,
        method: 'DELETE',
        url: '/api/program-actions/1*',
        response: {},
      })
      .as('routeDeleteActionSucceed');

    cy
      .get('.sidebar')
      .find('.js-menu')
      .click();

    cy
      .get('.picklist')
      .contains('Delete Program Action')
      .click();

    cy
      .wait('@routeDeleteActionSucceed')
      .its('url')
      .should('contain', 'api/program-actions/1');

    cy
      .get('.workflows__list')
      .find('.table-list__item')
      .contains('Test Name')
      .should('not.exist');

    cy
      .get('.sidebar')
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
        created_at: testTs(),
        updated_at: testTs(),
      },
      relationships: {
        owner: {
          data: {
            id: '11111',
            type: 'roles',
          },
        },
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
      .routeProgramFlows(() => [])
      .routeProgram()
      .visit('/program/1/action/1')
      .wait('@routeProgramActions')
      .wait('@routeProgramFlows')
      .wait('@routeProgramAction')
      .wait('@routeProgram');

    cy
      .get('.sidebar')
      .find('[data-save-region]')
      .should('be.empty');

    cy
      .get('.sidebar')
      .find('[data-name-region] .js-input')
      .clear();

    cy
      .get('.sidebar')
      .find('[data-save-region]')
      .contains('Save')
      .should('be.disabled');

    cy
      .get('.sidebar')
      .find('[data-name-region] .js-input')
      .type('testing name');

    cy
      .get('.sidebar')
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
      .get('.sidebar')
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
      .get('.sidebar')
      .find('[data-save-region]')
      .should('be.empty');

    cy
      .get('.sidebar')
      .find('[data-name-region] .js-input')
      .type('cancel this text');

    cy
      .get('.sidebar')
      .find('[data-save-region]')
      .contains('Cancel')
      .click();

    cy
      .get('.sidebar')
      .find('[data-name-region] .js-input')
      .should('have.value', 'testing name');

    cy
      .get('.sidebar')
      .find('[data-save-region]')
      .should('be.empty');

    cy
      .get('.sidebar')
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
      .get('.sidebar')
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
      .get('.sidebar')
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
        expect(data.relationships.owner.data.id).to.equal('22222');
        expect(data.relationships.owner.data.type).to.equal('roles');
      });

    cy
      .get('.sidebar')
      .find('[data-owner-region]')
      .contains('Nurse');

    cy
      .get('.sidebar')
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
      .get('.sidebar')
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
      .get('.sidebar')
      .find('[data-attachment-region]')
      .contains('Add Attachment...')
      .click();

    cy
      .get('.picklist')
      .contains('Test Form')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.form.data.id).to.equal('11111');
      });

    cy
      .get('.sidebar__footer')
      .contains('Created')
      .next()
      .should('contain', formatDate(testTs(), 'AT_TIME'));

    cy
      .get('.sidebar__footer')
      .contains('Last Updated')
      .next()
      .should('contain', formatDate(testTs(), 'AT_TIME'));
  });

  specify('display action sidebar with no org forms', function() {
    cy
      .server()
      .routeProgramAction()
      .routeProgramActions()
      .routeProgramFlows(() => [])
      .routeProgram()
      .routeForms(fx => {
        fx.data = [];

        return fx;
      })
      .visit('/program/1/action/1')
      .wait('@routeProgramActions')
      .wait('@routeProgramFlows')
      .wait('@routeProgramAction')
      .wait('@routeProgram');

    cy
      .get('.sidebar')
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
      .routeProgramFlows(() => [])
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
      .wait('@routeProgramFlows')
      .wait('@routeProgramAction');

    cy
      .get('.alert-box__body')
      .should('contain', 'The Action you requested does not exist.');

    cy
      .get('.sidebar')
      .should('not.exist');
  });
});
