import _ from 'underscore';

import { testTs } from 'helpers/test-timestamp';

context('program page', function() {
  specify('context trail', function() {
    cy
      .routePrograms(fx => {
        fx.data[0].id = '1';

        fx.data[0].attributes.name = 'Test Program';
        fx.data[0].attributes.updated_at = testTs();

        return fx;
      })
      .routeProgram(fx => {
        fx.data.id = '1';
        fx.data.attributes.name = 'Test Program';

        return fx;
      })
      .routeProgramActions()
      .routeProgramFlows()
      .visit('/programs');

    cy
      .get('.table-list__item')
      .contains('Test Program')
      .click();

    cy
      .url()
      .should('contain', 'program/1');

    cy
      .get('.program__context-trail')
      .should('contain', 'Test Program')
      .contains('Back to List')
      .click();

    cy
      .url()
      .should('contain', 'programs');
  });

  specify('read only sidebar', function() {
    cy
      .routeProgram(fx => {
        fx.data.id = '1';
        fx.data.attributes.name = 'Test Program';
        fx.data.attributes.details = null;
        fx.data.attributes.published_at = testTs();
        fx.data.attributes.archived_at = null;
        fx.data.attributes.created_at = testTs();
        fx.data.attributes.updated_at = testTs();

        return fx;
      })
      .routeProgramFlows()
      .routeProgramActions()
      .visit('/program/1');

    cy
      .intercept('PATCH', '/api/programs/1', {
        statusCode: 204,
        body: {},
      })
      .as('routePatchProgram');

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
      .get('.program__context-trail')
      .should('contain', 'Testing');
  });

  specify('new flow sidebar', function() {
    cy
      .routeTags()
      .routeProgram(fx => {
        fx.data.id = '1';

        return fx;
      })
      .routeProgramActions(fx => [])
      .routeProgramFlows(fx => [])
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
      .get('.sidebar');
  });

  specify('action not from a flow', function() {
    const actionData = {
      id: '1',
      attributes: {
        name: 'Test Action',
        details: 'Details',
        published_at: null,
        archived_at: null,
        behavior: 'standard',
        outreach: 'disabled',
        allowed_uploads: [],
        days_until_due: 5,
        created_at: testTs(),
        updated_at: testTs(),
      },
      relationships: {
        'owner': { data: { id: '11111', type: 'teams' } },
        'program-flow': { data: null },
        'program': { data: { id: '1' } },
        'form': { data: null },
      },
    };

    cy
      .routeProgram(fx => {
        fx.data.id = '1';
        fx.data.attributes.name = 'Test Program';
        fx.data.attributes.details = null;
        fx.data.attributes.published_at = testTs();

        return fx;
      })
      .routeProgramFlows(fx => {
        fx.data = [];
        return fx;
      })
      .routeProgramActions(fx => {
        fx.data = _.sample(fx.data, 1);

        fx.data[0] = actionData;

        return fx;
      })
      .routeProgramAction(fx => {
        fx.data = actionData;

        return fx;
      })
      .routeTags()
      .visit('/program/1');

    cy
      .get('.table-list__item')
      .first()
      .find('[data-behavior-region] button')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .should('have.length', 2)
      .contains('Conditional')
      .should('not.exist');

    cy
      .get('.table-list__item')
      .contains('Test Action')
      .click();

    cy
      .get('.sidebar')
      .find('[data-behavior-region]')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .should('have.length', 2)
      .contains('Conditional')
      .should('not.exist');
  });
});
