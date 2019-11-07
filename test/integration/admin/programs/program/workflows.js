import _ from 'underscore';
import moment from 'moment';

context('program workflows page', function() {
  specify('action list', function() {
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

        fx.data[1].attributes.name = 'Last In List';
        fx.data[1].attributes.updated_at = moment.utc().subtract(2, 'days').format();

        fx.data[2].attributes.name = 'Second In List';
        fx.data[2].attributes.updated_at = moment.utc().subtract(1, 'days').format();


        return fx;
      }, '1')
      .routeProgramAction(fx => {
        fx.data = testAction;
        return fx;
      })
      .visit('/program/1')
      .wait('@routeProgram')
      .wait('@routeProgramActions');

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
      .should('contain', 'Last In List');

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
      .routeActionActivity()
      .visit('/program/1')
      .wait('@routeProgram')
      .wait('@routeProgramActions');

    cy
      .get('.program__layout')
      .find('.js-add')
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
      .contains('Draft');

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
});
