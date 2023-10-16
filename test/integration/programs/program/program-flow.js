import _ from 'underscore';

import { testTs } from 'helpers/test-timestamp';

context('program flow page', function() {
  specify('context trail', function() {
    cy
      .routeProgramFlow(fx => {
        fx.data.id = '1';

        fx.data.attributes.name = 'Test Flow';
        fx.data.attributes.updated_at = testTs();

        return fx;
      })
      .routeProgramFlowActions(_.identity, '1')
      .routeProgramByProgramFlow(fx => {
        fx.data.id = '1';
        fx.data.attributes.name = 'Test Program';

        return fx;
      })
      .routeProgram()
      .routePrograms()
      .routeProgramActions()
      .routeProgramFlows()
      .visit('/program-flow/1')
      .wait('@routeProgramFlow')
      .wait('@routeProgramFlowActions')
      .wait('@routeProgramByProgramFlow');

    cy
      .get('.program-flow__context-trail')
      .contains('Test Program')
      .click();

    cy
      .url()
      .should('contain', 'program/1');

    cy
      .go('back');

    cy
      .get('.app-nav')
      .find('.app-nav__bottom-button')
      .contains('Admin Tools')
      .click();

    cy
      .get('.js-picklist-item')
      .contains('Programs')
      .click()
      .go('back');

    cy
      .get('.program-flow__context-trail')
      .contains('Back to List')
      .click();

    cy
      .url()
      .should('contain', 'programs');
  });

  specify('program sidebar', function() {
    cy
      .routeProgramFlow()
      .routeProgramFlowActions()
      .routeProgramByProgramFlow(fx => {
        fx.data.id = '1';

        fx.data.attributes.name = 'Test Program';
        fx.data.attributes.details = '';
        fx.data.attributes.published_at = testTs();

        return fx;
      })
      .routeProgram()
      .intercept('PATCH', '/api/programs/1', {
        statusCode: 204,
        body: {},
      })
      .as('routePatchProgram')
      .visit('/program-flow/1')
      .wait('@routeProgramFlow')
      .wait('@routeProgramFlowActions')
      .wait('@routeProgramByProgramFlow');

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
      .get('.program-flow__context-trail')
      .should('contain', 'Testing');
  });

  specify('flow header', function() {
    cy
      .routeTags()
      .routeProgramFlow(fx => {
        fx.data.id = '1';

        fx.data.attributes.name = 'Test Flow';
        fx.data.attributes.details = 'Test Flow Details';
        fx.data.attributes.published_at = null;
        fx.data.attributes.behavior = 'standard';
        fx.data.attributes.updated_at = testTs();

        fx.data.relationships['program-actions'].data = _.sample(fx.data.relationships['program-actions'].data, 5);

        _.each(fx.data.relationships['program-actions'].data, (programAction, index) => {
          programAction.id = `${ index + 1 }`;
        });

        return fx;
      })
      .routeProgramFlowActions(fx => {
        fx.data = _.sample(fx.data, 5);
        _.each(fx.data, (programAction, index) => {
          programAction.id = `${ index + 1 }`;
          programAction.attributes.published_at = null;
          programAction.attributes.behavior = 'standard';
        });

        _.each(fx.data, flowAction => {
          flowAction.relationships['program-flow'].data.id = '1';
        });

        return fx;
      })
      .routeProgramByProgramFlow()
      .intercept('PATCH', '/api/program-flows/1', {
        statusCode: 204,
        body: {},
      })
      .as('routePatchFlow')
      .visit('/program-flow/1')
      .wait('@routeProgramByProgramFlow')
      .wait('@routeProgramFlow')
      .wait('@routeProgramFlowActions');

    cy
      .get('.program-flow__header')
      .as('flowHeader')
      .find('.program-flow__name')
      .contains('Test Flow');

    cy
      .get('@flowHeader')
      .find('.program-flow__details')
      .contains('Test Flow Details');

    cy
      .get('@flowHeader')
      .find('.program-action--standard')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('Automated')
      .click();

    cy
      .wait('@routePatchFlow')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.behavior).to.equal('automated');
      });

    cy
      .get('@flowHeader')
      .find('.program-action--automated')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('Standard')
      .click();

    cy
      .wait('@routePatchFlow')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.behavior).to.equal('standard');
      });

    cy
      .get('@flowHeader')
      .find('[data-owner-region]')
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
  });

  specify('Flow does not exist', function() {
    cy
      .routeProgramByProgramFlow()
      .routeProgramFlowActions()
      .intercept('GET', '/api/program-flows/1', {
        statusCode: 404,
        body: {
          errors: [{
            id: '1',
            status: '404',
            title: 'Not Found',
            detail: 'Cannot find action',
            source: { parameter: 'flowId' },
          }],
        },
      })
      .as('routeFlow404')
      .visit('/program-flow/1')
      .wait('@routeProgramByProgramFlow')
      .wait('@routeFlow404');

    cy
      .url()
      .should('contain', '404');
  });

  specify('flow actions list', function() {
    cy
      .routeTags()
      .routeForm()
      .routeAction()
      .routeProgramFlow(fx => {
        fx.data.id = '1';
        fx.data.attributes.behavior = 'standard';
        fx.data.attributes.published_at = null;

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

        fx.data[0].attributes.sequence = 0;
        fx.data[0].attributes.name = 'First In List';
        fx.data[0].attributes.updated_at = testTs();
        fx.data[0].attributes.behavior = 'standard';
        fx.data[0].attributes.published_at = null;
        fx.data[0].attributes.outreach = 'patient';
        fx.data[0].relationships.owner.data = null;
        fx.data[0].relationships.form.data = { id: '11111' };
        fx.data[0].relationships['program-flow'] = { data: { id: '1' } };

        fx.data[1].attributes.sequence = 2;
        fx.data[1].attributes.name = 'Third In List';
        fx.data[1].attributes.behavior = 'standard';
        fx.data[1].attributes.published_at = null;
        fx.data[1].relationships['program-flow'] = { data: { id: '1' } };

        fx.data[2].attributes.sequence = 1;
        fx.data[2].attributes.name = 'Second In List';
        fx.data[2].attributes.behavior = 'standard';
        fx.data[2].attributes.published_at = null;
        fx.data[2].attributes.days_until_due = 3;
        fx.data[2].relationships['program-flow'] = { data: { id: '1' } };

        fx.included.push({ id: '11111', type: 'forms', attributes: { name: 'Test Form' } });

        return fx;
      })
      .routePrograms()
      .routeProgramByProgramFlow()
      .intercept('GET', '/api/program-actions/*', {
        statusCode: 204,
        body: {},
      })
      .as('routeProgramAction')
      .visit('/program-flow/1')
      .wait('@routeProgramFlow')
      .wait('@routeProgramFlowActions')
      .wait('@routeProgramByProgramFlow');

    cy
      .intercept('PATCH', 'api/program-flows/1/actions', {
        statusCode: 204,
        body: {},
      })
      .as('routeUpdateActionSequences');

    cy
      .get('.program-flow__list')
      .as('actionList')
      .find('.table-list__item')
      .first()
      .find('.program-flow__sort-handle')
      .trigger('pointerdown', { button: 0, force: true })
      .trigger('dragstart', { force: true });

    cy
      .get('.table-list__item')
      .first()
      .find('.fa-share-from-square');

    cy
      .get('.table-list__item')
      .first()
      .next()
      .find('.fa-file-lines');

    cy
      .get('.program-flow__list')
      .trigger('dragover', 'center')
      .trigger('drop', 'center');

    cy
      .wait('@routeUpdateActionSequences')
      .its('request.body')
      .should(({ data }) => {
        expect(data[0].id).to.equal('3');
        expect(data[0].attributes.sequence).to.equal(0);
        expect(data[1].id).to.equal('1');
        expect(data[1].attributes.sequence).to.equal(1);
        expect(data[2].id).to.equal('2');
        expect(data[2].attributes.sequence).to.equal(2);
      });

    cy
      .intercept('PATCH', '/api/program-actions/1', {
        statusCode: 204,
        body: {},
      })
      .as('routePatchAction');

    cy
      .intercept('POST', '/api/program-actions', {
        statusCode: 201,
        body: {
          data: {
            id: '98765',
            attributes: {
              name: 'Test Name',
              created_at: testTs(),
              updated_at: testTs(),
            },
            relationships: {
              'program-flow': { data: { id: '1' } },
            },
          },
        },
      })
      .as('routePostAction');

    cy
      .intercept('POST', '/api/program-flows/1/actions', {
        statusCode: 201,
        body: {},
      })
      .as('routePostFlowAction');

    cy
      .intercept('PATCH', '/api/program-flows/1/actions', {
        statusCode: 201,
        body: {},
      });

    cy
      .get('.program-flow__list')
      .as('actionList')
      .find('.table-list__item')
      .first()
      .should('contain', 'Second In List')
      .next()
      .should('contain', 'First In List')
      .next()
      .should('contain', 'Third In List');

    cy
      .get('@actionList')
      .contains('First In List')
      .click();

    cy
      .get('@actionList')
      .find('.is-selected')
      .find('[data-behavior-region]')
      .click();

    cy
      .get('.picklist')
      .contains('Automated')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.behavior).to.equal('automated');
      });

    cy
      .get('.sidebar')
      .as('actionSidebar')
      .find('.program-action--automated');

    cy
      .get('@actionList')
      .find('.is-selected')
      .find('[data-owner-region]')
      .contains('Flow Owner')
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
        expect(data.relationships.owner.data.type).to.equal('teams');
      });

    cy
      .get('@actionSidebar')
      .find('[data-owner-region]')
      .contains('Nurse');

    cy
      .get('@actionList')
      .find('.is-selected')
      .find('[data-owner-region]')
      .contains('NUR');

    cy
      .get('@actionList')
      .find('.is-selected')
      .find('[data-due-region]')
      .click();

    cy
      .get('.picklist')
      .contains('Same Day')
      .click();

    cy
      .get('@actionSidebar')
      .find('[data-due-region]')
      .contains('Same Day');

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.days_until_due).to.equal(0);
      });

    cy
      .get('@actionSidebar')
      .find('[data-form-region]')
      .should('contain', 'Test Form')
      .click();

    cy
      .get('@actionList')
      .find('.is-selected')
      .find('[data-due-region]')
      .click();

    cy
      .get('.picklist')
      .contains('Clear Selection')
      .click();

    cy
      .get('@actionList')
      .find('.is-selected')
      .find('[data-due-region]')
      .find('button')
      .should('not.have.text');

    cy
      .get('@actionSidebar')
      .find('.js-close')
      .click();

    cy
      .get('@actionList')
      .find('.is-selected')
      .should('not.exist');

    cy
      .get('.js-add-action')
      .click();

    cy
      .get('@actionList')
      .find('.is-selected')
      .contains('New Flow Action')
      .click();

    cy
      .get('@actionSidebar')
      .find('[data-name-region] .js-input')
      .type('Test Name');

    cy
      .get('@actionSidebar')
      .find('.js-save')
      .click();

    cy
      .wait('@routePostAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.name).to.equal('Test Name');
      });

    cy
      .get('.table-list__item')
      .first()
      .find('.js-form')
      .should('not.exist');

    cy
      .get('.table-list__item')
      .first()
      .next()
      .find('.js-form')
      .click();

    cy
      .url()
      .should('contain', 'form/11111/preview');

    cy
      .go('back');

    cy
      .intercept('DELETE', '/api/program-actions/*', {
        statusCode: 403,
        body: {
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
      .as('routeDeleteFlowActionFailure');

    cy
      .get('@actionList')
      .find('.table-list__item')
      .first()
      .click('top');

    cy
      .get('@actionSidebar')
      .find('.js-menu')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('Delete Program Action')
      .click()
      .wait('@routeDeleteFlowActionFailure');

    cy
      .get('.alert-box')
      .should('contain', 'Insufficient permissions to delete action');

    cy
      .intercept('DELETE', '/api/program-actions/*', {
        statusCode: 204,
        body: {},
      })
      .as('routeDeleteFlowAction');

    cy
      .get('@actionSidebar')
      .find('.js-menu')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('Delete Program Action')
      .click();
  });
});
