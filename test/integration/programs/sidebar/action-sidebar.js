import _ from 'underscore';

import formatDate from 'helpers/format-date';
import { testTs } from 'helpers/test-timestamp';

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
      .contains('Select Role...')
      .should('be.disabled');

    cy
      .get('.sidebar')
      .find('[data-due-region]')
      .contains('Select # Days')
      .should('be.disabled');

    cy
      .get('.sidebar')
      .find('[data-form-region]')
      .contains('Add Form')
      .should('be.disabled');

    cy
      .get('.sidebar')
      .find('[data-form-sharing-region]')
      .contains('Enable Form Sharing')
      .should('be.disabled');

    cy
      .get('.sidebar')
      .find('[data-name-region] .js-input')
      .type('Test Name')
      .tab()
      .tab()
      .tab()
      .should('have.class', 'js-cancel')
      .typeEnter();

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
      .find('[data-details-region] .js-input')
      .type('a{backspace}')
      .type('Test{enter} Details')
      .tab()
      .should('have.class', 'js-save')
      .typeEnter();

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
      .contains('Added')
      .next()
      .should('contain', formatDate(testTs(), 'AT_TIME'));

    cy
      .get('.sidebar__footer')
      .contains('Updated')
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
        outreach: 'disabled',
        days_until_due: 5,
        created_at: testTs(),
        updated_at: testTs(),
      },
      relationships: {
        'owner': {
          data: {
            id: '11111',
            type: 'teams',
          },
        },
        'program-flow': {
          data: {
            id: '1',
            type: 'program-flows',
          },
        },
      },
    };

    cy
      .server()
      .routeProgramFlow(fx => {
        fx.data.id = '1';
        fx.data.attributes.status = 'draft';

        _.each(fx.data.relationships['program-actions'].data, (programAction, index) => {
          programAction.id = `${ index + 1 }`;
        });

        return fx;
      })
      .routeProgramFlowActions(fx => {
        fx.data = _.first(fx.data, 3);

        _.each(fx.data, (programAction, index) => {
          programAction.id = `${ index + 1 }`;
        });

        fx.data[0] = actionData;

        return fx;
      }, '1')
      .routeProgramAction(fx => {
        fx.data = actionData;

        return fx;
      })
      .routePrograms()
      .routeProgramByProgramFlow()
      .routeForms(fx => {
        fx.data[5].attributes.name = 'A Form';
        fx.data[5].attributes.published_at = testTs();
        fx.data[4].attributes.name = 'B Form';
        fx.data[4].attributes.published_at = testTs();
        fx.data[1].attributes.name = 'C Form';
        fx.data[1].attributes.published_at = null;
        fx.data[2].attributes.name = 'D Form';
        fx.data[2].attributes.published_at = testTs();
        fx.data[3].attributes.name = 'E Form';
        fx.data[3].attributes.published_at = testTs();
        return fx;
      })
      .visit('/program-flow/1')
      .wait('@routeProgramFlowActions')
      .wait('@routeProgramFlow');

    cy
      .get('.program-flow__list')
      .contains('Name')
      .click();

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
      .find('[data-published-region]')
      .contains('Draft')
      .click();

    cy
      .get('.picklist')
      .contains('Conditional')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.status).to.equal('conditional');
      });

    cy
      .get('.sidebar')
      .find('[data-state-region]')
      .contains('To Do')
      .as('stateButton')
      .trigger('pointerover');

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
      .find('.js-picklist-item')
      .eq(1)
      .should('contain', 'Coordinator')
      .next()
      .should('contain', 'Nurse')
      .next()
      .should('contain', 'Other')
      .next()
      .should('contain', 'Pharmacist')
      .next()
      .should('contain', 'Physician')
      .next()
      .should('contain', 'Specialist')
      .next()
      .should('contain', 'Supervisor')
      .parent()
      .find('.js-picklist-item')
      .contains('Nurse')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.owner.data.id).to.equal('22222');
        expect(data.relationships.owner.data.type).to.equal('teams');
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
      .find('[data-form-region]')
      .contains('Add Form...')
      .click();


    cy
      .get('.sidebar')
      .find('[data-form-sharing-region]')
      .contains('Enable Form Sharing')
      .should('be.disabled');

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .should('not.contain', 'C Form')
      .eq(1)
      .should('contain', 'A Form')
      .next()
      .should('contain', 'B Form')
      .next()
      .should('contain', 'D Form')
      .next()
      .should('contain', 'E Form')
      .next()
      .should('contain', 'Test Form')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.form.data.id).to.equal('11111');
      });


    cy
      .get('.sidebar')
      .find('[data-form-sharing-region]')
      .contains('Enable Form Sharing')
      .should('not.be.disabled')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.outreach).to.equal('patient');
      });

    cy
      .get('.sidebar')
      .find('.js-disable')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.outreach).to.equal('disabled');
      });

    cy
      .get('.sidebar')
      .find('[data-form-sharing-region]')
      .contains('Enable Form Sharing')
      .click()
      .wait('@routePatchAction');

    cy
      .get('.sidebar')
      .find('[data-form-region]')
      .click();

    cy
      .get('.picklist')
      .contains('Clear Selection')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.form.data).to.be.null;
        expect(data.attributes.outreach).to.equal('disabled');
      });

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
      .get('.sidebar')
      .find('[data-form-region]')
      .contains('Add Form...')
      .click();

    cy
      .get('.picklist')
      .contains('Test Form')
      .click();

    cy
      .get('.sidebar')
      .find('[data-form-region]')
      .should('contain', 'Test Form')
      .find('.fa-up-right-and-down-left-from-center')
      .click();

    cy
      .url()
      .should('contain', 'form/11111/preview');

    cy
      .go('back');
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
      .find('[data-form-region]')
      .contains('Add Form...')
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

  specify('outreach disabled', function() {
    cy
      .server()
      .routeSettings(fx => {
        const careTeamOutreach = _.find(fx.data, setting => setting.id === 'care_team_outreach');
        careTeamOutreach.attributes.value = false;

        return fx;
      })
      .routeProgramAction()
      .routeProgramActions()
      .routeProgramFlows()
      .routeProgram()
      .visit('/program/1/action/1')
      .wait('@routeProgramActions')
      .wait('@routeProgramFlows')
      .wait('@routeProgramAction')
      .wait('@routeProgram');

    cy
      .get('.sidebar')
      .find('[data-form-sharing-region]')
      .should('be.empty');
  });
});
