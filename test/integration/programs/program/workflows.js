import _ from 'underscore';

import { testTs, testTsSubtract } from 'helpers/test-timestamp';

context('program workflows page', function() {
  specify('actions in list', function() {
    const testAction = {
      id: '1',
      attributes: {
        name: 'First In List',
        details: null,
        status: 'published',
        outreach: 'patient',
        days_until_due: null,
        created_at: testTs(),
        updated_at: testTs(),
      },
      relationships: {
        program: { data: { id: '1' } },
        owner: {
          data: {
            id: '11111',
            type: 'teams',
          },
        },
        form: { data: { id: '1' } },
      },
    };

    cy
      .routeTags()
      .routeProgram(fx => {
        fx.data.id = '1';

        return fx;
      })
      .routeProgramActions(fx => {
        fx.data = _.sample(fx.data, 3);
        fx.data[0] = testAction;

        fx.data[1].attributes.name = 'Third In List';
        fx.data[1].attributes.updated_at = testTsSubtract(2);

        fx.data[2].attributes.name = 'Second In List';
        fx.data[2].attributes.updated_at = testTsSubtract(1);


        return fx;
      })
      .routeProgramAction(fx => {
        fx.data = testAction;
        return fx;
      })
      .routeProgramFlows(fx => {
        fx.data = _.sample(fx.data, 1);

        fx.data[0].attributes.name = 'Fourth In List';
        fx.data[0].relationships.owner.data = null;
        fx.data[0].attributes.updated_at = testTsSubtract(3);

        return fx;
      })
      .visit('/program/1')
      .wait('@routeProgram')
      .wait('@routeProgramActions')
      .wait('@routeProgramFlows');

    cy
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/program-actions/1',
        response: {},
      })
      .as('routePatchAction');

    cy
      .get('.workflows__list')
      .find('.table-list__item')
      .first()
      .should('contain', 'First In List')
      .next()
      .should('contain', 'Second In List')
      .next()
      .should('contain', 'Third In List')
      .next()
      .should('contain', 'Fourth In List')
      .find('.workflows__flow-icon');

    cy
      .get('.workflows__list')
      .contains('First In List')
      .click();

    cy
      .get('.workflows__list')
      .find('.is-selected')
      .find('[data-published-region]')
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
      .get('.workflows__list')
      .find('.is-selected')
      .find('[data-owner-region]')
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
      });

    cy
      .get('.workflows__list')
      .find('.table-list__item')
      .last()
      .find('[data-owner-region]')
      .find('button')
      .should('not.have.text');

    cy
      .get('.workflows__list')
      .find('.is-selected')
      .find('[data-due-region]')
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
      .get('.workflows__list')
      .find('.is-selected')
      .find('[data-due-region]')
      .click();

    cy
      .get('.picklist')
      .contains('Clear Selection')
      .click();

    cy
      .get('.workflows__list')
      .find('.is-selected')
      .find('[data-due-region]')
      .find('button')
      .should('not.have.text');

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
      .get('.table-list__item')
      .first()
      .find('.js-form')
      .click();

    cy
      .url()
      .should('contain', 'form/1/preview');

    cy
      .go('back');

    cy
      .get('.table-list__item')
      .first()
      .next()
      .find('.js-form')
      .should('not.exist');
  });

  specify('flow in list', function() {
    cy
      .routeProgram(fx => {
        fx.data.id = '1';

        return fx;
      })
      .routeProgramActions(fx => [])
      .routeProgramFlows(fx => {
        fx.data = _.sample(fx.data, 1);
        fx.data[0].id = 1;

        fx.data[0].attributes.status = 'draft';
        fx.data[0].relationships.owner.data = null;

        return fx;
      })
      .routeProgramByProgramFlow()
      .routeProgramFlowActions()
      .routeProgramFlow()
      .visit('/program/1')
      .wait('@routeProgram')
      .wait('@routeProgramActions')
      .wait('@routeProgramFlows');

    cy
      .get('.workflows__list')
      .find('.table-list__item')
      .first()
      .as('flowItem');

    cy
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/program-flows/1',
        response: {},
      })
      .as('routePatchFlow');

    cy
      .get('@flowItem')
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
      .get('@flowItem')
      .find('[data-owner-region]')
      .contains('NUR');

    cy
      .get('@flowItem')
      .find('.workflows__flow-name')
      .click()
      .wait('@routeProgramFlow');

    cy
      .url()
      .should('contain', 'program-flow/1');
  });

  specify('add action', function() {
    cy
      .routeTags()
      .routeProgram(fx => {
        fx.data.id = '1';

        return fx;
      })
      .routeProgramAction()
      .routeProgramActions(_.identity, '1')
      .routeProgramFlows(fx => [])
      .routeActionActivity()
      .routeActionFiles()
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
      .contains('New Action')
      .click();

    cy
      .get('.program__layout')
      .find('.is-selected')
      .should('contain', 'New Program Action')
      .as('newAction');

    cy
      .get('@newAction')
      .find('[data-published-region]')
      .find('button')
      .should('be.disabled')
      .find('svg')
      .should('have.class', 'fa-pen-to-square');

    cy
      .get('@newAction')
      .find('[data-owner-region]')
      .find('button')
      .should('be.disabled')
      .find('svg')
      .should('have.class', 'fa-circle-user');

    cy
      .get('@newAction')
      .find('[data-due-region]')
      .find('button')
      .should('be.disabled')
      .find('svg')
      .should('have.class', 'fa-stopwatch');

    cy
      .get('@newAction')
      .click();

    cy
      .get('.sidebar')
      .find('.js-close')
      .click();

    cy
      .get('.workflows__list')
      .should('not.contain', 'New Program Action')
      .find('.is-selected')
      .should('not.exist');
  });

  specify('add flow', function() {
    cy
      .routeTags()
      .routeProgram(fx => {
        fx.data.id = '1';

        return fx;
      })
      .routeProgramActions(_.identity, '1')
      .routeProgramFlows(fx => [])
      .routeProgramByProgramFlow()
      .routeProgramFlowActions()
      .routeProgramFlow()
      .routeActionActivity()
      .routeActionFiles()
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
      .get('.program__layout')
      .find('.is-selected')
      .should('contain', 'New Program Flow')
      .as('newFlow');

    cy
      .get('@newFlow')
      .find('.workflows__flow-status svg')
      .should('have.class', 'fa-pen-to-square');

    cy
      .get('@newFlow')
      .find('[data-owner-region]')
      .find('button')
      .should('be.disabled')
      .find('svg')
      .should('have.class', 'fa-circle-user');

    cy
      .get('@newFlow')
      .click();

    cy
      .get('.sidebar')
      .as('flowSidebar');

    cy
      .get('@flowSidebar')
      .find('[data-name-region] .js-input')
      .type('Test Flow');

    cy
      .route({
        status: 201,
        method: 'POST',
        url: '/api/programs/1/relationships/flows',
        response() {
          return {
            id: '1',
            attributes: {
              updated_at: testTs(),
              name: 'Test Flow',
            },
          };
        },
      })
      .as('routePostFlow');

    cy
      .get('@flowSidebar')
      .find('.js-save')
      .click()
      .wait('@routePostFlow')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.name).to.equal('Test Flow');
      });

    cy
      .url()
      .should('contain', 'program-flow/1');

    cy
      .go('back');

    cy
      .get('[data-add-region]')
      .contains('Add')
      .click();

    cy
      .get('.picklist')
      .contains('New Flow')
      .click();

    cy
      .get('@flowSidebar')
      .find('.js-close')
      .click();

    cy
      .get('.workflows__list')
      .should('not.contain', 'New Program Flow')
      .find('.is-selected')
      .should('not.exist');
  });
});
