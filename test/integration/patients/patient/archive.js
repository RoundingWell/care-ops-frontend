import _ from 'underscore';
import dayjs from 'dayjs';

import { testTs, testTsSubtract } from 'helpers/test-timestamp';
import { testDate, testDateSubtract } from 'helpers/test-date';

context('patient archive page', function() {
  specify('action, flow and events list', function() {
    const testTime = dayjs(testDate()).hour(12).valueOf();

    cy.clock(testTime, ['Date']);

    cy
      .routesForPatientAction()
      .routePatient(fx => {
        fx.data.id = '1';
        fx.data.relationships.workspaces.data = [
          {
            id: '11111',
            type: 'workspaces',
          },
        ];

        return fx;
      })
      .routePatientActions(fx => {
        fx.data = _.sample(fx.data, 3);
        fx.data[0] = {
          id: '1',
          attributes: {
            name: 'First In List',
            details: null,
            duration: 0,
            due_date: null,
            due_time: null,
            updated_at: testTs(),
          },
          relationships: {
            patient: { data: { id: '11111' } },
            owner: {
              data: {
                id: '11111',
                type: 'clinicians',
              },
            },
            state: { data: { id: '55555' } },
            form: { data: { id: '11111' } },
            files: { data: [{ id: '1' }] },
          },
        };

        fx.data[2].attributes.name = 'Third In List';
        fx.data[2].relationships.state = { data: { id: '55555' } };
        fx.data[2].attributes.updated_at = testTsSubtract(2);
        fx.data[2].attributes.due_time = '09:00:00';
        fx.data[2].attributes.due_date = testDateSubtract(2);

        fx.data[1].attributes.name = 'Not In List';
        fx.data[1].relationships.state = { data: { id: '33333' } };
        fx.data[1].attributes.updated_at = testTsSubtract(6);

        return fx;
      })
      .routePatientFlows(fx => {
        fx.data = _.sample(fx.data, 3);

        fx.data[0].attributes.name = 'Second In List';
        fx.data[0].relationships.state = { data: { id: '55555' } };
        fx.data[0].attributes.updated_at = testTsSubtract(1);

        fx.data[2].attributes.name = 'Last In List';
        fx.data[2].id = '2';
        fx.data[2].relationships.state = { data: { id: '55555' } };
        fx.data[2].attributes.updated_at = testTsSubtract(6);

        fx.data[1].attributes.name = 'Not In List';
        fx.data[1].relationships.state = { data: { id: '33333' } };
        fx.data[1].attributes.updated_at = testTsSubtract(6);

        return fx;
      })
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.relationships.state = { data: { id: '55555' } };
        fx.data.relationships.form = { data: { id: '1' } };

        return fx;
      })
      .routeFormByAction()
      .routeFormDefinition()
      .routeFormActionFields()
      .visit('/patient/archive/1')
      .wait('@routePatient')
      .wait('@routePatientFlows');

    cy
      .wait('@routePatientActions')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[state]=55555,66666,77777');

    // Filters only done id 55555
    cy
      .get('.patient__list')
      .find('tr')
      .should('have.lengthOf', 4);

    cy
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/actions/1',
        response: {},
      })
      .as('routePatchAction');

    cy
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/flows/2',
        response: {},
      })
      .as('routePatchFlow');

    cy
      .get('.patient__list')
      .find('.table-list__item')
      .first()
      .should('contain', 'First In List')
      .next()
      .should('contain', 'Second In List')
      .next()
      .should('contain', 'Third In List')
      .next()
      .should('contain', 'Last In List');

    cy
      .get('.patient__list')
      .find('.table-list__item')
      .eq(2)
      .find('[data-due-day-region]')
      .find('.is-overdue')
      .should('not.exist');

    cy
      .get('.patient__list')
      .find('.table-list__item')
      .eq(2)
      .find('[data-due-time-region]')
      .find('.is-overdue')
      .should('not.exist');

    cy
      .get('.patient__list')
      .find('.table-list__item')
      .eq(2)
      .find('.fa-paperclip')
      .should('not.exist');

    cy
      .get('.patient__list')
      .should('contain', 'Second In List')
      .find('.patient__flow-icon');

    cy
      .get('.patient__list')
      .contains('First In List')
      .click();

    cy
      .get('.patient__list')
      .find('.is-selected')
      .find('[data-owner-region] button')
      .should('contain', 'Clinician McTester')
      .should('be.disabled');

    cy
      .get('.patient__list')
      .find('.is-selected')
      .find('[data-due-day-region] button')
      .should('be.disabled');

    cy
      .get('.patient__list')
      .find('.is-selected')
      .find('[data-due-time-region] button')
      .should('be.disabled');

    cy
      .get('.patient__list')
      .find('.is-selected')
      .find('[data-state-region]')
      .find('.fa-circle-check')
      .click();

    cy
      .get('.picklist')
      .contains('In Progress')
      .click()
      .wait(800); // wait the length of the animation

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.state.data.id).to.equal('33333');
      });

    cy
      .get('.patient__list')
      .find('tr')
      .should('have.lengthOf', 3);

    cy
      .get('.sidebar')
      .find('.fa-circle-dot')
      .click();

    cy
      .get('.picklist')
      .contains('To Do')
      .click();

    cy
      .get('.patient__list')
      .find('tr')
      .should('have.lengthOf', 3);

    cy
      .get('.sidebar')
      .contains('To Do')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('Done')
      .click();

    cy
      .get('.patient__list')
      .find('tr')
      .should('have.lengthOf', 4);

    cy
      .routeFlow()
      .routeFlowActions()
      .routePatientByFlow();

    cy
      .get('.patient__list')
      .find('.table-list__item')
      .last()
      .as('flowItem');

    cy
      .get('@flowItem')
      .click('top')
      .wait('@routeFlow')
      .wait('@routePatientByFlow')
      .wait('@routeFlowActions');

    cy
      .url()
      .should('contain', 'flow/2');

    cy
      .go('back');

    cy
      .get('@flowItem')
      .find('.fa-circle-check')
      .click();

    cy
      .get('.picklist')
      .contains('To Do')
      .click();

    cy
      .wait('@routePatchFlow')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.state.data.id).to.equal('22222');
      });

    cy
      .get('@flowItem')
      .find('.fa-circle-exclamation');

    cy
      .get('.patient__list')
      .find('tr')
      .should('have.lengthOf', 3);

    cy
      .get('.table-list__item')
      .first()
      .next()
      .next()
      .find('[data-form-region]')
      .should('be.empty');

    cy
      .get('.table-list__item')
      .first()
      .find('.fa-paperclip')
      .should('exist');

    cy
      .get('.table-list__item')
      .first()
      .find('[data-form-region]')
      .click();

    cy
      .url()
      .should('contain', 'patient-action/1/form/1');

    cy.clock().invoke('restore');
  });
});
