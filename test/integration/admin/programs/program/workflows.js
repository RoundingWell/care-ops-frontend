import _ from 'underscore';
import moment from 'moment';

context('program workflows page', function() {
  specify('action/flow list', function() {
    const testAction = {
      id: '1',
      attributes: {
        name: 'First In List',
        details: null,
        status: 'published',
        days_until_due: null,
        created_at: moment.utc().format(),
        updated_at: moment.utc().format(),
      },
      relationships: {
        program: { data: { id: '1' } },
        role: { data: { id: '11111' } },
      },
    };

    cy
      .server()
      .routeProgram(fx => {
        fx.data.id = '1';

        return fx;
      })
      .routeProgramActions(fx => {
        fx.data = _.sample(fx.data, 3);
        fx.data[0] = testAction;

        fx.data[1].attributes.name = 'Third In List';
        fx.data[1].attributes.updated_at = moment.utc().subtract(2, 'days').format();

        fx.data[2].attributes.name = 'Second In List';
        fx.data[2].attributes.updated_at = moment.utc().subtract(1, 'days').format();


        return fx;
      }, '1')
      .routeProgramAction(fx => {
        fx.data = testAction;
        return fx;
      })
      .routeProgramFlows(fx => {
        fx.data = _.sample(fx.data, 1);

        fx.data[0].attributes.name = 'Fourth In List';
        fx.data[0].relationships.role.data = null;
        fx.data[0].attributes.updated_at = moment.utc().subtract(3, 'days').format();

        return fx;
      }, '1')
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
        expect(data.relationships.role.data.id).to.equal('22222');
      });

    cy
      .get('.workflows__list')
      .find('.table-list__item')
      .last()
      .find('[data-owner-region]')
      .find('button')
      .should('have.class', 'is-icon-only');

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
      .should('have.class', 'is-icon-only');
  });
  specify('add action', function() {
    cy
      .server()
      .routeProgram(fx => {
        fx.data.id = '1';

        return fx;
      })
      .routeProgramAction()
      .routeProgramActions(_.identity, '1')
      .routeProgramFlows(fx => [])
      .routeActionActivity()
      .visit('/program/1')
      .wait('@routeProgram')
      .wait('@routeProgramActions')
      .wait('@routeProgramFlows');

    cy
      .get('[data-add-region]')
      .find('.workflows__button')
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
      .should('have.class', 'fa-edit');

    cy
      .get('@newAction')
      .find('[data-owner-region]')
      .find('button')
      .should('be.disabled')
      .find('svg')
      .should('have.class', 'fa-user-circle');

    cy
      .get('@newAction')
      .find('[data-due-region]')
      .find('button')
      .should('be.disabled')
      .find('svg')
      .should('have.class', 'fa-stopwatch');

    cy
      .get('.program-action-sidebar')
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
      .server()
      .routeProgram(fx => {
        fx.data.id = '1';

        return fx;
      })
      .routeProgramAction()
      .routeProgramActions(_.identity, '1')
      .routeProgramFlows(fx => [])
      .routeActionActivity()
      .visit('/program/1')
      .wait('@routeProgram')
      .wait('@routeProgramActions')
      .wait('@routeProgramFlows');

    cy
      .get('[data-add-region]')
      .find('.workflows__button')
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
      .find('[data-published-region]')
      .find('button')
      .should('be.disabled')
      .find('svg')
      .should('have.class', 'fa-edit');

    cy
      .get('@newFlow')
      .find('[data-owner-region]')
      .find('button')
      .should('be.disabled')
      .find('svg')
      .should('have.class', 'fa-user-circle');

    cy
      .get('.program-flow-sidebar')
      .find('.js-close')
      .click();

    cy
      .get('.workflows__list')
      .should('not.contain', 'New Program Flow')
      .find('.is-selected')
      .should('not.exist');
  });
  specify('update program flow', function() {
    cy
      .server()
      .routeProgram(fx => {
        fx.data.id = '1';

        return fx;
      })
      .routeProgramActions(fx => [])
      .routeProgramFlows(fx => {
        fx.data = _.sample(fx.data, 1);

        fx.data[0].attributes.status = 'draft';
        fx.data[0].relationships.role.data = null;

        return fx;
      }, '1')
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
      .get('@flowItem')
      .find('[data-published-region]')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains('Published')
      .click();

    cy
      .get('@flowItem')
      .find('.program-action--published');

    cy
      .get('@flowItem')
      .find('[data-owner-region] .is-icon-only')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains('Nurse')
      .click();

    cy
      .get('@flowItem')
      .find('[data-owner-region]')
      .contains('NUR');
  });
});
