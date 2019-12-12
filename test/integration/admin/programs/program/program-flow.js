import _ from 'underscore';
import moment from 'moment';

const now = moment.utc();

context('program page', function() {
  specify('context trail', function() {
    cy
      .server()
      .routeProgram(fx => {
        fx.data.id = '1';

        fx.data.attributes.name = 'Test Program';
        fx.data.attributes.details = 'Test Program Details';

        return fx;
      })
      .routeProgramActions(fx => [])
      .routeProgramFlows(fx => {
        fx.data = [_.sample(fx.data)];

        fx.data[0].id = '1';
        fx.data[0].attributes.name = 'Test Flow';
        fx.data[0].relationships.program.data.id = '1';

        return fx;
      })
      .routeProgramFlow(fx => {
        fx.data.id = '1';

        fx.data.attributes.name = 'Test Flow';
        fx.data.attributes.updated_at = now.format();

        return fx;
      })
      .routePrograms(fx => {
        fx.data = [_.sample(fx.data)];

        fx.data[0].id = '1';

        fx.data[0].attributes.name = 'Test Program';
        fx.data[0].attributes.updated_at = now.format();

        return fx;
      })
      .visit('/programs')
      .wait('@routePrograms');

    cy
      .get('.table-list__item')
      .contains('Test Program')
      .click()
      .wait('@routeProgram')
      .wait('@routeProgramActions')
      .wait('@routeProgramFlows');


    cy
      .get('.table-list__item')
      .contains('Test Flow')
      .click()
      .wait('@routeProgramFlow');

    cy
      .url()
      .should('contain', 'program/1/flow/1');

    cy
      .get('.program-flow__context-trail')
      .contains('Test Program')
      .click()
      .wait('@routeProgram');

    cy
      .get('.table-list__item')
      .contains('Test Flow')
      .click()
      .wait('@routeProgramFlow');

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
      .server()
      .routeProgramFlow(fx => {
        fx.data.id = '1';

        fx.data.attributes.name = 'Test Flow';
        fx.data.attributes.updated_at = now.format();

        return fx;
      })
      .routeProgram(fx => {
        fx.data.id = '1';
        fx.data.attributes.name = 'Test Program';
        fx.data.attributes.details = null;
        fx.data.attributes.published = true;
        fx.data.attributes.created_at = now.format();
        fx.data.attributes.updated_at = now.format();

        return fx;
      })
      .visit('/program/1/flow/1');

    cy
      .get('.program-sidebar')
      .should('contain', 'Test Program')
      .should('contain', 'No description given')
      .should('contain', 'On');
  });

  specify('flow header', function() {
    cy
      .server()
      .routeProgram(fx => {
        fx.data.id = '1';

        fx.data.attributes.name = 'Test Program';
        fx.data.attributes.details = 'Test Program Details';

        return fx;
      })
      .routeProgramFlow(fx => {
        fx.data.id = '1';

        fx.data.attributes.name = 'Test Flow';
        fx.data.attributes.details = 'Test Flow Details';
        fx.data.attributes.status = 'published';
        fx.data.attributes.updated_at = now.format();

        return fx;
      })
      .visit('/program/1/flow/1')
      .wait('@routeProgramFlow');

    cy
      .get('.program-flow__name')
      .contains('Test Flow');

    cy
      .get('.program-flow__details')
      .contains('Test Flow Details');

    cy
      .get('.program-action--published')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .first()
      .click();

    cy
      .get('.program-action--draft');

    cy
      .get('[data-owner-region]')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains('Nurse')
      .click();

    cy
      .get('[data-owner-region]')
      .contains('NUR');
  });

  specify('edit flow', function() {
    cy
      .server()
      .routeProgram(fx => {
        fx.data.id = '1';

        fx.data.attributes.name = 'Test Program';
        fx.data.attributes.details = 'Test Program Details';

        return fx;
      })
      .routeProgramFlow(fx => {
        fx.data.id = '1';

        fx.data.attributes.name = 'Test Flow';
        fx.data.attributes.details = null;
        fx.data.attributes.status = 'draft';
        fx.data.attributes.updated_at = now.format();

        return fx;
      })
      .visit('/program/1/flow/1')
      .wait('@routeProgramFlow');

    cy
      .get('.program-flow__name')
      .contains('Test Flow');


    cy
      .get('.program-action--draft');

    cy
      .get('.js-flow')
      .as('flowHeader')
      .should('contain', 'Add Details')
      .click()
      .should('have.class', 'is-selected');

    cy
      .get('.program-flow-sidebar')
      .as('flowSidebar')
      .find('.js-close')
      .click();

    cy
      .get('@flowHeader')
      .click();

    cy
      .get('@flowSidebar')
      .find('[data-details-region] textarea')
      .type('Here are some details');

    cy
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/program-flows/1',
        response: {},
      })
      .as('routePatchFlow');

    cy
      .get('@flowSidebar')
      .find('.js-save')
      .click()
      .wait('@routePatchFlow');

    cy
      .get('@flowHeader')
      .should('contain', 'Here are some details')
      .click();

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
      .get('@flowSidebar')
      .find('.js-close')
      .click();

    cy
      .get('.program-sidebar');
  });

  specify('Flow does not exist', function() {
    cy
      .server()
      .routeProgram(fx => {
        fx.data.id = '1';

        return fx;
      })
      .routeProgramFlow(fx => null)
      .visit('/program/1/flow/1')
      .wait('@routeProgramFlow')
      .wait('@routeProgram');

    cy
      .get('.alert-box')
      .contains('The Flow you requested does not exist.');

    cy
      .url()
      .should('contain', 'program/1');
  });

  specify('creating a flow', function() {
    cy
      .server()
      .routeProgram(fx => {
        fx.data.id = '1';

        fx.data.attributes.name = 'Test Program';
        fx.data.attributes.details = 'Test Program Details';

        return fx;
      })
      .routeProgramActions(fx => [])
      .routeProgramFlows(fx => [])
      .routeNewProgramFlow(fx => {
        fx.data.id = '1';

        fx.data.attributes.name = 'My New Flow';
        fx.data.attributes.details = 'Flow Details';
        fx.data.attributes.updated_at = now.format();

        return fx;
      })
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
      .get('.program-flow-sidebar')
      .as('flowSidebar');

    cy
      .get('@flowSidebar')
      .find('[data-save-region] .button--green')
      .should('be.disabled');

    cy
      .get('@flowSidebar')
      .find('[data-name-region] textarea')
      .type('My New Flow');

    cy
      .get('@flowSidebar')
      .find('[data-details-region] textarea')
      .type('Flow Details');

    cy
      .get('@flowSidebar')
      .find('[data-save-region] .button--green')
      .should('not.be.disabled')
      .click()
      .wait('@routeNewProgramFlow');

    cy
      .url()
      .should('contain', 'program/1/flow/1');
  });
});
