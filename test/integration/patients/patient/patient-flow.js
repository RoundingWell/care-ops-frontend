import _ from 'underscore';

import { testTs, testTsSubtract } from 'helpers/test-timestamp';
import { testDateAdd, testDateSubtract } from 'helpers/test-date';

const tomorrow = testDateAdd(1);

context('patient flow page', function() {
  specify('context trail', function() {
    cy
      .routeFlows(fx => {
        fx.data = _.sample(fx.data, 1);

        fx.data[0].id = '1';
        fx.data[0].attributes.name = 'Test Flow';
        fx.data[0].relationships.state.data.id = '33333';
        fx.data[0].relationships.patient.data.id = '1';

        fx.included = [{
          id: '1',
          type: 'patients',
          attributes: {
            first_name: 'Test',
            last_name: 'Patient',
          },
        }];

        return fx;
      })
      .routeFlow(fx => {
        fx.data.id = '1';

        fx.data.attributes.name = 'Test Flow';
        fx.data.attributes.updated_at = testTs();
        fx.data.relationships.patient = { data: { id: '1' } };

        fx.included.push({
          id: '1',
          type: 'patients',
          attributes: {
            first_name: 'Test',
            last_name: 'Patient',
          },
        });

        return fx;
      })
      .routePatientByFlow()
      .routeFlowActions(fx => {
        const flow = _.find(fx.included, { id: '1' });

        flow.attributes.name = 'Test Flow';

        return fx;
      })
      .routeActions()
      .visit('/worklist/owned-by')
      .wait('@routeActions');

    cy
      .get('.worklist-list__toggle')
      .contains('Flows')
      .click()
      .wait('@routeFlows');

    cy
      .get('.table-list')
      .find('.table-list__item')
      .first()
      .click()
      .wait('@routeFlow')
      .wait('@routePatientByFlow');

    cy
      .get('.patient-flow__context-trail')
      .should('contain', 'Test Flow')
      .contains('Test Patient')
      .click();

    cy
      .url()
      .should('contain', '/patient/dashboard/1');

    cy
      .go('back');

    cy
      .get('.patient-flow__context-trail')
      .contains('Back to List')
      .click();

    cy
      .url()
      .should('contain', '/worklist/owned-by');
  });

  specify('patient flow action sidebar', function() {
    cy
      .routeFlow()
      .routeFlowActions()
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.attributes.name = 'Test Action';

        fx.data.relationships.flow = { data: { id: '1' } };

        return fx;
      })
      .routePatientByFlow()
      .routeActionActivity()
      .visit('/flow/1/action/1')
      .wait('@routeFlow')
      .wait('@routePatientByFlow')
      .wait('@routeFlowActions');

    cy
      .get('.sidebar')
      .find('[data-name-region] .action-sidebar__name')
      .should('contain', 'Test Action');
  });

  specify('flow actions list', function() {
    cy
      .routeFlow(fx => {
        fx.data.id = '1';

        fx.data.attributes.name = 'Test Flow';
        fx.data.attributes.updated_at = testTs();
        fx.data.relationships.state.data.id = '33333';

        const flowActions = _.sample(fx.data.relationships.actions.data, 3);

        _.each(flowActions, (action, index) => {
          action.id = `${ index + 1 }`;
        });

        fx.data.relationships.actions.data = flowActions;

        return fx;
      })
      .routePatientByFlow()
      .routeFlowActions(fx => {
        fx.data = _.first(fx.data, 3);

        fx.data[0].id = '1';
        fx.data[0].attributes.name = 'First In List';
        fx.data[0].attributes.due_date = testDateSubtract(1);
        fx.data[0].attributes.created_at = testTsSubtract(1);
        fx.data[0].attributes.sequence = 1;
        fx.data[0].attributes.outreach = 'patient';
        fx.data[0].attributes.sharing = 'sent';
        fx.data[0].relationships.patient.data.id = '1';
        fx.data[0].relationships.state.data.id = '22222';
        fx.data[0].relationships.owner.data = {
          id: '22222',
          type: 'teams',
        };
        fx.data[0].relationships.form.data = { id: '11111' };
        fx.data[0].relationships.files = { data: [{ id: '1' }] };

        fx.data[1].id = '2';
        fx.data[1].attributes.name = 'Third In List';
        fx.data[1].attributes.due_date = testDateAdd(1);
        fx.data[1].attributes.created_at = testTsSubtract(3);
        fx.data[1].attributes.sequence = 3;
        fx.data[1].relationships.patient.data.id = '1';
        fx.data[1].relationships.state.data.id = '55555';
        fx.data[1].relationships.owner.data = {
          id: '33333',
          type: 'teams',
        };

        fx.data[2].id = '3';
        fx.data[2].attributes.name = 'Second In List';
        fx.data[2].attributes.due_date = testDateAdd(2);
        fx.data[2].attributes.created_at = testTsSubtract(2);
        fx.data[2].attributes.sequence = 2;
        fx.data[2].relationships.patient.data.id = '1';
        fx.data[2].relationships.state.data.id = '33333';
        fx.data[2].relationships.owner.data = {
          id: '44444',
          type: 'teams',
        };

        fx.included = _.reject(fx.included, { type: 'flows' });

        fx.included.push({ id: '11111', type: 'forms', attributes: { name: 'Test Form' } });

        return fx;
      })
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/actions/2',
        response: {},
      })
      .as('routePatchAction')
      .routeActionActivity()
      .routePatientField()
      .visit('/flow/1')
      .wait('@routeFlow')
      .wait('@routePatientByFlow')
      .wait('@routeFlowActions');

    cy
      .get('.patient-flow__list')
      .as('actionsList')
      .find('.table-list__item')
      .should('have.length', 3);

    cy
      .get('@actionsList')
      .find('.table-list__item')
      .first()
      .should($action => {
        expect($action.find('.fa-circle-exclamation')).to.exist;
        expect($action.find('[data-owner-region]')).to.contain('NUR');
        expect($action.find('[data-due-day-region] .is-overdue')).to.exist;
        expect($action.find('[data-form-region]')).not.to.be.empty;
        expect($action.find('.fa-paperclip')).to.exist;
      });

    cy
      .get('@actionsList')
      .find('.table-list__item')
      .first()
      .next()
      .should($action => {
        expect($action.find('.fa-circle-dot')).to.exist;
        expect($action.find('[data-owner-region]')).to.contain('PHS');
        expect($action.find('.fa-paperclip')).to.not.exist;
      });

    cy
      .get('@actionsList')
      .find('.table-list__item')
      .last()
      .should($action => {
        expect($action.find('.fa-circle-check')).to.exist;
        expect($action.find('[data-owner-region]')).to.contain('PHM');
        expect($action.find('[data-owner-region] button')).to.be.disabled;
        expect($action.find('[data-due-day-region] button')).to.be.disabled;
        expect($action.find('[data-due-time-region] button')).to.be.disabled;
      })
      .find('.fa-circle-check')
      .click();

    cy
      .get('.picklist')
      .find('.fa-circle-dot')
      .click();

    cy
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.relationships.state = { data: { id: '22222' } };
        fx.data.relationships.form = { data: { id: '1' } };

        return fx;
      });

    cy
      .get('@actionsList')
      .find('.table-list__item')
      .last()
      .as('lastAction')
      .should($action => {
        expect($action.find('.fa-circle-dot')).to.exist;
        expect($action.find('[data-owner-region] button')).not.to.be.disabled;
        expect($action.find('[data-due-day-region] button')).not.to.be.disabled;
        expect($action.find('[data-due-time-region] button')).not.to.be.disabled;
      })
      // Trigger the click on the table-list__item clicks the owner button
      .find('.patient__action-icon')
      .click();

    cy
      .get('@lastAction')
      .should('have.class', 'is-selected')
      .find('[data-owner-region]')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('Nurse')
      .click();

    cy
      .get('@lastAction')
      .find('[data-owner-region]')
      .contains('NUR');

    cy
      .get('@lastAction')
      .find('[data-due-day-region]')
      .click();

    cy
      .get('.datepicker')
      .find('.js-next')
      .click()
      .then($el => {
        const dueDay = '1';
        const dueMonth = $el.text().trim();

        cy
          .get('.datepicker')
          .find('.datepicker__days li')
          .contains(dueDay)
          .click();

        cy
          .get('.sidebar')
          .find('[data-due-day-region]')
          .should('contain', `${ dueMonth } ${ dueDay }`);
      });

    cy
      .get('@lastAction')
      .find('[data-due-time-region]')
      .click();

    cy
      .get('.picklist')
      .contains('11:15 AM')
      .click();

    cy
      .get('@lastAction')
      .find('[data-due-time-region]')
      .should('contain', '11:15 AM');

    cy
      .route({
        status: 403,
        method: 'DELETE',
        url: '/api/actions/1',
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
      .as('routeDeleteFlowActionFailure');

    cy
      .get('.sidebar')
      .find('.js-menu')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('Delete Action')
      .click()
      .wait('@routeDeleteFlowActionFailure');

    cy
      .get('.alert-box')
      .should('contain', 'Insufficient permissions to delete action');


    cy
      .route({
        status: 204,
        method: 'DELETE',
        url: '/api/actions/1',
        response: {},
      })
      .as('routeDeleteFlowAction');

    cy
      .get('.sidebar')
      .find('.js-menu')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('Delete Action')
      .click()
      .wait('@routeDeleteFlowAction');

    cy
      .get('@actionsList')
      .find('.table-list__item')
      .should('have.length', 2);
  });

  specify('add action', function() {
    cy
      .routeFlow(fx => {
        fx.data.id = '1';
        fx.data.relationships['program-flow'] = { data: { id: '1' } };
        fx.included.push({
          id: '1',
          type: 'program-actions',
          attributes: {
            status: 'conditional',
            name: 'Conditional',
            details: '',
            days_until_due: 0,
            sequence: 0,
          },
          relationships: {
            owner: { data: null },
            form: { data: { id: '11111' } },
          },
        });
        fx.included.push({
          id: '2',
          type: 'program-actions',
          attributes: {
            status: 'published',
            name: 'Published',
            details: 'details',
            days_until_due: 1,
            sequence: 1,
          },
          relationships: {
            owner: { data: { id: '11111', type: 'teams' } },
            form: { data: { id: '11111' } },
          },
        });
        fx.included.push({
          id: '1',
          type: 'program-flows',
          attributes: {
            name: 'Program Flow',
          },
          relationships: {
            'program-actions': {
              data: [
                {
                  id: '1',
                  type: 'program-actions',
                },
                {
                  id: '2',
                  type: 'program-actions',
                },
              ],
            },
          },
        });

        return fx;
      })
      .routePatientByFlow()
      .routeFlowActions()
      .routeActionActivity()
      .visit('/flow/1')
      .wait('@routeFlow')
      .wait('@routePatientByFlow')
      .wait('@routeFlowActions');

    cy
      .route({
        status: 201,
        method: 'POST',
        url: '/api/flows/**/relationships/actions',
        response() {
          return {
            data: {
              id: 'test-1',
              attributes: {
                updated_at: testTs(),
                due_time: null,
              },
            },
          };
        },
      })
      .as('routePostAction');

    cy
      .routeAction(fx => {
        fx.data.id = 'test-1';
        fx.data.attributes.name = 'Conditional';
        return fx;
      });

    cy
      .get('.patient-flow__actions')
      .contains('Add')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .first()
      .contains('Conditional');

    cy
      .get('.picklist')
      .find('.picklist__item')
      .last()
      .should('contain', 'Published')
      .should('not.contain', 'Draft');

    cy
      .get('.picklist')
      .find('.picklist__item')
      .first()
      .click();

    cy
      .wait('@routePostAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.name).to.equal('Conditional');
        expect(data.relationships['program-action'].data.id).to.equal('1');
      });

    cy
      .wait('@routeAction')
      .url()
      .should('contain', 'flow/1/action/test-1');

    cy
      .get('[data-content-region]')
      .find('.is-selected')
      .contains('Conditional');
  });

  specify('failed flow', function() {
    cy

      .route({
        status: 404,
        url: '/api/flows/1**',
      })
      .visit('/flow/1');

    cy
      .url()
      .should('contain', '/404');
  });

  specify('empty view', function() {
    cy
      .routeFlow(fx => {
        fx.data.id = '1';

        fx.data.attributes.name = 'Test Flow';
        fx.data.attributes.updated_at = testTs();

        return fx;
      })
      .routePatientByFlow()
      .routeFlowActions(fx => {
        fx.data = [];

        return fx;
      })
      .visit('/flow/1')
      .wait('@routeFlow')
      .wait('@routePatientByFlow')
      .wait('@routeFlowActions');

    cy
      .get('.patient-flow__empty-list')
      .contains('No Actions');
  });

  specify('flow owner assignment', function() {
    cy
      .routeFlow(fx => {
        fx.data.id = '1';

        const flowActions = _.sample(fx.data.relationships.actions.data, 3);

        _.each(flowActions, (action, index) => {
          action.id = `${ index + 1 }`;
        });

        fx.data.relationships.actions.data = flowActions;
        fx.data.relationships.state.data.id = '33333';
        fx.data.relationships.owner.data = {
          id: '22222',
          type: 'teams',
        };

        return fx;
      })
      .routePatientByFlow()
      .routeFlowActions(fx => {
        fx.data = _.first(fx.data, 4);

        _.each(fx.data, (action, index) => {
          action.id = `${ index + 1 }`;
        });

        fx.data[0].attributes.sequence = 1;
        fx.data[1].attributes.sequence = 2;
        fx.data[2].attributes.sequence = 3;
        fx.data[3].attributes.sequence = 4;

        fx.data[0].relationships.state.data.id = '22222';
        fx.data[1].relationships.state.data.id = '22222';
        fx.data[2].relationships.state.data.id = '22222';
        fx.data[3].relationships.state.data.id = '55555';

        fx.data[0].relationships.owner.data = {
          id: '22222',
          type: 'teams',
        };

        fx.data[1].relationships.owner.data = {
          id: '22222',
          type: 'clinicians',
        };

        fx.data[2].relationships.owner.data = {
          id: '11111',
          type: 'teams',
        };

        fx.data[3].relationships.owner.data = {
          id: '22222',
          type: 'teams',
        };

        fx.included = _.reject(fx.included, { type: 'flows' });
        fx.included.push({
          id: '22222',
          type: 'clinicians',
          attributes: {
            name: 'Other Clinician',
          },
        });

        return fx;
      })
      .routeActionActivity()
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/flows/1',
        response: {},
      })
      .as('routePatchFlow')
      .visit('/flow/1')
      .wait('@routeFlow')
      .wait('@routePatientByFlow')
      .wait('@routeFlowActions');

    cy
      .get('.patient-flow__list')
      .as('actionsList');

    cy
      .get('@actionsList')
      .find('.table-list__item')
      .first()
      .find('[data-owner-region]')
      .should('contain', 'NUR');

    cy
      .get('@actionsList')
      .find('.table-list__item')
      .eq(1)
      .find('[data-owner-region]')
      .should('contain', 'Other');

    cy
      .get('@actionsList')
      .find('.table-list__item')
      .eq(2)
      .find('[data-owner-region]')
      .should('contain', 'CO');

    cy
      .get('@actionsList')
      .find('.table-list__item')
      .last()
      .find('[data-owner-region]')
      .should('contain', 'NUR');

    cy
      .get('[data-header-region]')
      .find('[data-owner-region]')
      .click();

    cy
      .get('.picklist')
      .contains('McTester')
      .click();

    cy
      .wait('@routePatchFlow')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.owner.data.id).to.equal('11111');
        expect(data.relationships.owner.data.type).to.equal('clinicians');
      });

    cy
      .get('@actionsList')
      .find('.table-list__item')
      .first()
      .find('[data-owner-region]')
      .should('contain', 'McTester');

    cy
      .get('@actionsList')
      .find('.table-list__item')
      .eq(1)
      .find('[data-owner-region]')
      .should('contain', 'Other');

    cy
      .get('@actionsList')
      .find('.table-list__item')
      .eq(2)
      .find('[data-owner-region]')
      .should('contain', 'CO');

    cy
      .get('@actionsList')
      .find('.table-list__item')
      .last()
      .find('[data-owner-region]')
      .should('contain', 'NUR');

    cy
      .get('[data-header-region]')
      .find('[data-owner-region]')
      .click();

    cy
      .get('.picklist')
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
      .get('@actionsList')
      .find('.table-list__item')
      .first()
      .find('[data-owner-region]')
      .should('contain', 'McTester');

    cy
      .get('@actionsList')
      .find('.table-list__item')
      .eq(1)
      .find('[data-owner-region]')
      .should('contain', 'Other');

    cy
      .get('@actionsList')
      .find('.table-list__item')
      .eq(2)
      .find('[data-owner-region]')
      .should('contain', 'CO');

    cy
      .get('@actionsList')
      .find('.table-list__item')
      .last()
      .find('[data-owner-region]')
      .should('contain', 'NUR');
  });

  specify('flow progress bar', function() {
    cy
      .routeFlow(fx => {
        const flowActions = _.sample(fx.data.relationships.actions.data, 3);

        _.each(flowActions, (action, index) => {
          action.id = `${ index + 1 }`;
        });

        fx.data.relationships.actions.data = flowActions;
        fx.data.relationships.state.data.id = '33333';

        fx.data.meta.progress.complete = 0;
        fx.data.meta.progress.total = 3;

        return fx;
      })
      .routePatientByFlow()
      .routeFlowActions(fx => {
        fx.data = _.first(fx.data, 3);

        _.each(fx.data, (action, index) => {
          action.id = `${ index + 1 }`;
        });

        fx.data[0].relationships.state.data.id = '22222';
        fx.data[1].relationships.state.data.id = '22222';
        fx.data[2].relationships.state.data.id = '22222';

        fx.included = _.reject(fx.included, { type: 'flows' });

        return fx;
      })
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/actions/*',
        response: {},
      })
      .as('routePatchAction')
      .route({
        status: 204,
        method: 'DELETE',
        url: '/api/actions/*',
        response: {},
      })
      .as('routeDeleteAction')
      .routeAction(fx => {
        fx.data.relationships.state.data.id = '55555';

        return fx;
      })
      .routeActionActivity()
      .routePatientField()
      .routeActionComments()
      .visit('/flow/1')
      .wait('@routeFlow')
      .wait('@routePatientByFlow')
      .wait('@routeFlowActions');

    cy
      .get('.patient-flow__progress')
      .should('have.value', 0)
      .should('have.attr', 'max', '3');

    cy
      .get('.table-list__item')
      .first()
      .find('[data-state-region]')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('Done')
      .click();

    cy
      .get('.patient-flow__progress')
      .should('have.value', 1);

    cy
      .get('.table-list__item')
      .first()
      .find('[data-state-region]')
      .click();

    cy
      .get('.picklist')
      .contains('To Do')
      .click();

    cy
      .get('.patient-flow__progress')
      .should('have.value', 0);

    cy
      .get('.table-list__item')
      .first()
      .find('[data-state-region]')
      .click();

    cy
      .get('.picklist')
      .contains('In Progress')
      .click();

    cy
      .get('.patient-flow__progress')
      .should('have.value', 0);

    cy
      .get('.table-list__item')
      .first()
      .find('[data-state-region]')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('Done')
      .click();

    cy
      .get('.table-list__item')
      .last()
      .find('[data-state-region]')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('Done')
      .click();

    cy
      .get('.patient-flow__progress')
      .should('have.value', 2);

    cy
      .get('.table-list__item')
      .last()
      .find('[data-state-region]')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('Unable to Complete')
      .click();

    cy
      .get('.patient-flow__progress')
      .should('have.value', 2);

    cy
      .get('.table-list__item')
      .first()
      .click('top');

    cy
      .get('.sidebar')
      .find('.js-menu')
      .click();

    cy
      .get('.picklist')
      .contains('Delete Action')
      .click();

    cy
      .get('.patient-flow__progress')
      .should('have.value', 1)
      .and('have.attr', 'max', '2');
  });

  specify('bulk edit actions', function() {
    cy
      .routeFlow(fx => {
        fx.data.id = '1';

        fx.data.attributes.name = 'Test Flow';
        fx.data.attributes.updated_at = testTs();
        fx.data.relationships.state.data.id = '33333';

        const flowActions = _.sample(fx.data.relationships.actions.data, 3);

        _.each(flowActions, (action, index) => {
          action.id = `${ index + 1 }`;
        });

        fx.data.relationships.actions.data = flowActions;

        return fx;
      })
      .routePatientByFlow()
      .routeFlowActions(fx => {
        fx.data = _.first(fx.data, 3);

        fx.data[0].id = '1';
        fx.data[0].attributes.name = 'First In List';
        fx.data[0].attributes.due_date = testDateSubtract(1);
        fx.data[0].attributes.created_at = testTsSubtract(1);
        fx.data[0].attributes.sequence = 1;
        fx.data[0].relationships.patient.data.id = '1';
        fx.data[0].relationships.state.data.id = '22222';
        fx.data[0].relationships.owner.data = {
          id: '22222',
          type: 'teams',
        };
        fx.data[0].relationships.form.data = { id: '11111' };

        fx.data[1].id = '2';
        fx.data[1].attributes.name = 'Third In List';
        fx.data[1].attributes.due_date = testDateAdd(1);
        fx.data[1].attributes.created_at = testTsSubtract(3);
        fx.data[1].attributes.sequence = 3;
        fx.data[1].relationships.patient.data.id = '1';
        fx.data[1].relationships.state.data.id = '22222';
        fx.data[1].relationships.owner.data = {
          id: '33333',
          type: 'teams',
        };


        fx.data[2].id = '3';
        fx.data[2].attributes.name = 'Second In List';
        fx.data[2].attributes.due_date = testDateAdd(2);
        fx.data[2].attributes.created_at = testTsSubtract(2);
        fx.data[2].attributes.sequence = 2;
        fx.data[2].relationships.patient.data.id = '1';
        fx.data[2].relationships.state.data.id = '33333';
        fx.data[2].relationships.owner.data = {
          id: '44444',
          type: 'teams',
        };

        fx.included = _.reject(fx.included, { type: 'flows' });

        fx.included.push({ id: '11111', type: 'forms', attributes: { name: 'Test Form' } });

        return fx;
      })
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/actions/*',
        response: {},
      })
      .as('routePatchAction')
      .routeActionActivity()
      .routePatientField()
      .routeActionComments()
      .visit('/flow/1')
      .wait('@routeFlow')
      .wait('@routePatientByFlow')
      .wait('@routeFlowActions');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .as('firstRow')
      .find('.js-select')
      .click();

    cy
      .get('@firstRow')
      .should('have.class', 'is-selected');

    cy
      .get('@firstRow')
      .find('.js-select')
      .click();

    cy
      .get('@firstRow')
      .should('not.have.class', 'is-selected');

    cy
      .get('@firstRow')
      .find('.js-select')
      .click();

    cy
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.relationships.state.data.id = '22222';

        return fx;
      });

    cy
      .get('@firstRow')
      .find('.patient__action-icon')
      .click();

    cy
      .get('@firstRow')
      .find('.js-select')
      .click();

    cy
      .get('@firstRow')
      .should('have.class', 'is-selected');

    cy
      .get('@firstRow')
      .find('.js-select')
      .click();

    cy
      .get('[data-sidebar-region]')
      .find('.js-close')
      .click();

    cy
      .get('@firstRow')
      .should('have.class', 'is-selected');

    cy
      .get('[data-header-region]')
      .next()
      .find('.button--checkbox')
      .as('selectAll')
      .click();

    cy
      .get('[data-header-region]')
      .next()
      .find('.js-bulk-edit')
      .click();

    cy
      .get('.modal--sidebar')
      .as('bulkEditSidebar')
      .find('.js-submit')
      .click()
      .wait(['@routePatchAction', '@routePatchAction', '@routePatchAction']);

    cy
      .get('[data-header-region]')
      .next()
      .find('.button--checkbox')
      .click();

    cy
      .get('[data-header-region]')
      .next()
      .find('.button--checkbox')
      .click();

    cy
      .get('[data-header-region]')
      .next()
      .find('.button--checkbox')
      .click();

    cy
      .get('[data-header-region]')
      .next()
      .find('.js-cancel')
      .click();

    cy
      .get('[data-header-region]')
      .next()
      .find('.button--checkbox')
      .click();

    cy
      .get('[data-header-region]')
      .next()
      .find('.js-bulk-edit')
      .click();

    cy
      .get('@bulkEditSidebar')
      .find('.sidebar__heading')
      .should('contain', 'Edit 3 Actions');

    cy
      .get('@bulkEditSidebar')
      .find('[data-state-region]')
      .should('contain', 'Multiple States...');

    cy
      .get('@bulkEditSidebar')
      .find('[data-owner-region]')
      .should('contain', 'Multiple Owners...');

    cy
      .get('@bulkEditSidebar')
      .find('[data-due-date-region]')
      .should('contain', 'Multiple Dates...');

    cy
      .get('@bulkEditSidebar')
      .find('[data-due-time-region]')
      .should('contain', 'Multiple Times...');

    cy
      .get('@bulkEditSidebar')
      .find('[data-duration-region]')
      .should('contain', 'Multiple Durations...');

    cy
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/actions/1',
        response: {},
      })
      .as('patchAction1')
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/actions/2',
        response: {},
      })
      .as('patchAction2')
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/actions/3',
        response: {},
      })
      .as('patchAction3');

    cy
      .get('@bulkEditSidebar')
      .find('[data-state-region]')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('To Do')
      .click();

    cy
      .get('@bulkEditSidebar')
      .find('[data-owner-region]')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__group')
      .first()
      .should('contain', 'Clinician McTester')
      .next()
      .should('contain', 'Workspace One')
      .next()
      .find('.js-picklist-item')
      .contains('Nurse')
      .click();

    cy
      .get('@bulkEditSidebar')
      .find('[data-due-date-region]')
      .click();

    cy
      .get('.datepicker')
      .find('.datepicker__header .js-prev')
      .click();

    cy
      .get('.datepicker')
      .find('li:not(.is-other-month)')
      .first()
      .click();

    cy
      .get('@bulkEditSidebar')
      .find('[data-due-time-region]')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('10:00 AM')
      .click();

    cy
      .get('@bulkEditSidebar')
      .find('[data-due-date-region]')
      .find('.is-overdue');

    cy
      .get('@bulkEditSidebar')
      .find('[data-due-time-region]')
      .find('.is-overdue');

    cy
      .get('@bulkEditSidebar')
      .find('[data-due-date-region]')
      .click();

    cy
      .get('.datepicker')
      .find('.js-tomorrow')
      .click();

    cy
      .get('@bulkEditSidebar')
      .find('[data-due-date-region]')
      .find('.is-overdue')
      .should('not.exist');

    cy
      .get('@bulkEditSidebar')
      .find('[data-due-time-region]')
      .find('.is-overdue')
      .should('not.exist');

    cy
      .get('@bulkEditSidebar')
      .find('[data-duration-region]')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('5 mins')
      .click();

    cy
      .get('@bulkEditSidebar')
      .find('.js-submit')
      .click();

    cy
      .wait('@patchAction1')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.duration).to.equal(5);
        expect(data.attributes.due_time).to.equal('10:00:00');
        expect(data.attributes.due_date).to.equal(tomorrow);
        expect(data.relationships.state.data.id).to.equal('22222');
        expect(data.relationships.owner.data.id).to.equal('22222');
      });

    cy
      .wait('@patchAction2')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.duration).to.equal(5);
        expect(data.attributes.due_time).to.equal('10:00:00');
        expect(data.attributes.due_date).to.equal(tomorrow);
        expect(data.relationships.state.data.id).to.equal('22222');
        expect(data.relationships.owner.data.id).to.equal('22222');
      });

    cy
      .wait('@patchAction3')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.duration).to.equal(5);
        expect(data.attributes.due_time).to.equal('10:00:00');
        expect(data.attributes.due_date).to.equal(tomorrow);
        expect(data.relationships.state.data.id).to.equal('22222');
        expect(data.relationships.owner.data.id).to.equal('22222');
      });

    cy
      .get('.alert-box')
      .should('contain', '3 Actions have been updated');

    cy
      .get('.table-list')
      .find('.table-list__item .js-select')
      .click({ multiple: true });

    cy
      .get('.table-list')
      .find('.table-list__item .js-select')
      .last()
      .click();

    cy
      .get('[data-header-region]')
      .next()
      .find('.js-bulk-edit')
      .click();

    cy
      .route({
        status: 204,
        method: 'DELETE',
        url: '/api/actions/*',
        response: {},
      });

    cy
      .get('.modal--sidebar')
      .find('.modal__header--sidebar')
      .should('contain', 'Edit 2 Actions')
      .find('.js-menu')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('Delete Actions')
      .click();

    cy
      .get('.modal--small')
      .should('contain', 'Delete Actions?')
      .should('contain', 'Are you sure you want to delete the selected Actions? This cannot be undone.')
      .find('.js-submit')
      .click();

    cy
      .get('.alert-box')
      .should('contain', '2 Actions have been deleted');

    cy
      .get('.modal--small')
      .should('not.exist');

    cy
      .get('.modal--sidebar')
      .should('not.exist');

    cy
      .get('[data-header-region]')
      .next()
      .find('.js-bulk-edit')
      .should('not.exist');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .should('have.length', 1)
      .first()
      .find('.js-select')
      .click();

    cy
      .get('[data-header-region]')
      .next()
      .find('.js-bulk-edit')
      .click();

    cy
      .route({
        status: 404,
        method: 'PATCH',
        url: '/api/actions/*',
        response: {},
      })
      .as('failedPatchAction');

    cy
      .get('@bulkEditSidebar')
      .find('[data-due-time-region]')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('10:00 AM')
      .click();

    cy
      .get('@bulkEditSidebar')
      .find('[data-due-date-region]')
      .click();

    cy
      .get('.datepicker')
      .find('.js-clear')
      .click();

    cy
      .get('@bulkEditSidebar')
      .find('.js-submit')
      .click();

    cy
      .get('.alert-box')
      .should('contain', 'Something went wrong. Please try again.');
  });

  specify('click+shift multiselect', function() {
    cy
      .routeFlow()
      .routePatientByFlow()
      .routeFlowActions(fx => {
        fx.data = _.first(fx.data, 3);

        return fx;
      })
      .routePatientField()
      .routeActionActivity()
      .visit('/flow/1')
      .wait('@routeFlow')
      .wait('@routePatientByFlow')
      .wait('@routeFlowActions');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .find('.js-select')
      .click();

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .last()
      .find('.js-select')
      .click({ shiftKey: true });

    cy
      .get('.app-frame__content')
      .find('.table-list__item.is-selected')
      .should('have.length', 3);

    cy
      .get('.patient-flow__actions')
      .find('.js-bulk-edit')
      .should('contain', 'Edit 3 Actions');

    cy
      .get('.patient-flow__actions')
      .find('.js-cancel')
      .click();

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .last()
      .find('.js-select')
      .click();

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .find('.js-select')
      .click({ shiftKey: true });

    cy
      .get('.app-frame__content')
      .find('.table-list__item.is-selected')
      .should('have.length', 3);

    cy
      .get('.patient-flow__actions')
      .find('.js-bulk-edit')
      .should('contain', 'Edit 3 Actions');
  });
});
