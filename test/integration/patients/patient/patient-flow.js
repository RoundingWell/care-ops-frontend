import _ from 'underscore';

import { testTs, testTsSubtract } from 'helpers/test-timestamp';
import { testDateAdd, testDateSubtract } from 'helpers/test-date';
import { getRelationship } from 'helpers/json-api';

context('patient flow page', function() {
  specify('context trail', function() {
    cy
      .server()
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
      .routePatientFlowProgramFlow()
      .routeFlowActions(fx => {
        const flow = _.find(fx.included, { id: '1' });

        flow.attributes.name = 'Test Flow';

        return fx;
      })
      .routePatientFields()
      .visit('/worklist/owned-by')
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
      .server()
      .routeFlow()
      .routeFlowActions()
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.attributes.name = 'Test Action';

        fx.data.relationships.flow = { data: { id: '1' } };

        return fx;
      })
      .routePatientFlowProgramFlow()
      .routePatientByFlow()
      .routeActionActivity()
      .routeProgramByAction()
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
      .server()
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
      .routePatientFlowProgramFlow()
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
          type: 'roles',
        };
        fx.data[0].relationships.form.data = { id: '11111' };

        fx.data[1].id = '2';
        fx.data[1].attributes.name = 'Third In List';
        fx.data[1].attributes.due_date = testDateAdd(1);
        fx.data[1].attributes.created_at = testTsSubtract(3);
        fx.data[1].attributes.sequence = 3;
        fx.data[1].relationships.patient.data.id = '1';
        fx.data[1].relationships.state.data.id = '55555';
        fx.data[1].relationships.owner.data = {
          id: '33333',
          type: 'roles',
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
          type: 'roles',
        };

        fx.included = _.reject(fx.included, { type: 'flows' });

        fx.included.push({ id: '11111', type: 'forms', attributes: { name: 'Test Form' } });

        return fx;
      }, '1')
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/actions/2',
        response: {},
      })
      .as('routePatchAction')
      .routeActionActivity()
      .routeProgramByAction()
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
        expect($action.find('.fa-exclamation-circle')).to.exist;
        expect($action.find('[data-owner-region]')).to.contain('NUR');
        expect($action.find('[data-due-day-region] .is-overdue')).to.exist;
        expect($action.find('[data-form-region]')).not.to.be.empty;
      });

    cy
      .get('@actionsList')
      .find('.table-list__item')
      .first()
      .next()
      .should($action => {
        expect($action.find('.fa-dot-circle')).to.exist;
        expect($action.find('[data-owner-region]')).to.contain('PHS');
      });

    cy
      .get('@actionsList')
      .find('.table-list__item')
      .last()
      .should($action => {
        expect($action.find('.fa-check-circle')).to.exist;
        expect($action.find('[data-owner-region]')).to.contain('PHM');
        expect($action.find('[data-owner-region] button')).to.be.disabled;
        expect($action.find('[data-due-day-region] button')).to.be.disabled;
        expect($action.find('[data-due-time-region] button')).to.be.disabled;
      })
      .find('.fa-check-circle')
      .click();

    cy
      .get('.picklist')
      .find('.fa-dot-circle')
      .click();

    cy
      .get('@actionsList')
      .find('.table-list__item')
      .last()
      .as('lastAction')
      .should($action => {
        expect($action.find('.fa-dot-circle')).to.exist;
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
      .find('.picklist__item')
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
        url: '/api/actions/2',
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
      .find('.picklist__item')
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
        url: '/api/actions/2',
        response: {},
      })
      .as('routeDeleteFlowAction');

    cy
      .get('.sidebar')
      .find('.js-menu')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
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
      .server()
      .routeFlow(fx => {
        fx.data.id = '1';

        return fx;
      })
      .routePatientByFlow()
      .routeFlowActions()
      .routeProgramByAction()
      .routeActionActivity()
      .routePatientFlowProgramFlow(fx => {
        fx.included = _.sample(fx.included, 3);

        fx.included[0].attributes.status = 'published';
        fx.included[0].attributes.name = 'Published';
        fx.included[0].attributes.details = 'details';
        fx.included[0].attributes.days_until_due = 1;
        fx.included[0].attributes.sequence = 1;
        fx.included[0].relationships.owner = {
          included: {
            id: '11111',
            type: 'roles',
          },
        };
        fx.included[0].relationships.form = { data: { id: '11111' } };


        fx.included[1].id = '1';
        fx.included[1].attributes.status = 'conditional';
        fx.included[1].attributes.name = 'Conditional';
        fx.included[1].attributes.details = '';
        fx.included[1].attributes.days_until_due = 0;
        fx.included[1].attributes.sequence = 0;
        fx.included[1].relationships.owner = { data: null };

        fx.included[2].attributes.status = 'draft';
        fx.included[2].attributes.name = 'Draft';
        fx.included[2].attributes.days_until_due = null;

        fx.data.relationships['program-actions'] = { data: getRelationship(fx.included, 'program-actions') };

        return fx;
      })
      .visit('/flow/1')
      .wait('@routeFlow')
      .wait('@routePatientByFlow')
      .wait('@routeFlowActions')
      .wait('@routePatientFlowProgramFlow');

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

        // In this case let the cache work for testing routing only
        fx.data.attributes = {};
      });

    cy
      .get('[data-add-workflow-region]')
      .contains('Add')
      .click();

    cy
      .get('.picklist')
      .contains('Conditional')
      .next()
      .should('contain', 'Published')
      .should('not.contain', 'Draft')
      .prev()
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
      .server()
      .visit('/flow/1');

    cy
      .url()
      .should('contain', '/404');
  });

  specify('empty view', function() {
    cy
      .server()
      .routeFlow(fx => {
        fx.data.id = '1';

        fx.data.attributes.name = 'Test Flow';
        fx.data.attributes.updated_at = testTs();

        return fx;
      })
      .routePatientByFlow()
      .routePatientFlowProgramFlow()
      .routeFlowActions(fx => {
        fx.data = [];

        return fx;
      }, '1')
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
      .server()
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
          type: 'roles',
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
          type: 'roles',
        };

        fx.data[1].relationships.owner.data = {
          id: '22222',
          type: 'clinicians',
        };

        fx.data[2].relationships.owner.data = {
          id: '11111',
          type: 'roles',
        };

        fx.data[3].relationships.owner.data = {
          id: '22222',
          type: 'roles',
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
      }, '1')
      .routePatientFlowProgramFlow()
      .routeActionActivity()
      .routeProgramByAction()
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
        expect(data.relationships.owner.data.type).to.equal('roles');
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
      .server()
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
      }, '1')
      .routePatientFlowProgramFlow()
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
      .routeProgramByAction()
      .visit('/flow/1')
      .wait('@routeFlow')
      .wait('@routePatientByFlow')
      .wait('@routeFlowActions');

    cy
      .get('.patient-flow__header__progress')
      .should('have.value', 0)
      .should('have.attr', 'max', '3');

    cy
      .get('.table-list__item')
      .first()
      .find('[data-state-region]')
      .click();

    cy
      .get('.picklist')
      .contains('Done')
      .click();

    cy
      .get('.patient-flow__header__progress')
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
      .get('.patient-flow__header__progress')
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
      .get('.patient-flow__header__progress')
      .should('have.value', 0);

    cy
      .get('.table-list__item')
      .first()
      .find('[data-state-region]')
      .click();

    cy
      .get('.picklist')
      .contains('Done')
      .click();

    cy
      .get('.table-list__item')
      .last()
      .find('[data-state-region]')
      .click();

    cy
      .get('.picklist')
      .contains('Done')
      .click();

    cy
      .get('.patient-flow__header__progress')
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
      .get('.patient-flow__header__progress')
      .should('have.value', 1)
      .and('have.attr', 'max', '2');
  });
});
