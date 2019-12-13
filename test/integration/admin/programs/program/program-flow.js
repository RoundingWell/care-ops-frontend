import _ from 'underscore';
import moment from 'moment';

const now = moment.utc();

context('program flow page', function() {
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

    cy
      .get('.js-menu')
      .click();

    cy
      .get('.picklist')
      .should('contain', 'Update Program')
      .should('contain', 'Edit')
      .click();

    cy
      .get('.programs-sidebar')
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
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/program-flows/1',
        response: {},
      })
      .as('routePatchFlow');

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
      .wait('@routePatchFlow')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.status).to.equal('draft');
      });

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
      .wait('@routePatchFlow')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.role.data.id).to.equal('22222');
      });

    cy
      .get('[data-owner-region]')
      .contains('NUR');
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

  specify('flow actions list', function() {
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
      .routeProgramFlowActions(fx => {
        fx.data[0].attributes.name = 'Test Action';

        return fx;
      }, '1', '1')
      .routeProgramAction(fx => {
        fx.data.attributes.name = 'Test Action';

        return fx;
      })
      .visit('/program/1/flow/1')
      .wait('@routeProgramFlow')
      .wait('@routeProgramFlowActions');
  });
});
