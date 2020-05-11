import _ from 'underscore';
import moment from 'moment';

const now = moment.utc();

context('patient flow page', function() {
  specify('context trail', function() {
    cy
      .server()
      .routePatientFlows(fx => {
        fx.data = _.sample(fx.data, 1);

        fx.data[0].id = '1';
        fx.data[0].attributes.name = 'Test Flow';
        fx.data[0].relationships.state.data.id = '33333';

        return fx;
      }, '1')
      .routeFlow(fx => {
        fx.data.id = '1';

        fx.data.attributes.name = 'Test Flow';
        fx.data.attributes.updated_at = now.format();
        fx.data.relationships.patient = { data: { id: '1' } };

        fx.included.push({
          id: '1',
          type: 'patients',
          attributes: {
            first_name: 'Test',
            last_name: 'Test Patient',
          },
        });

        return fx;
      })
      .routeFlowActions()
      .routePatientFields()
      .visit('/worklist/owned-by')
      .wait('@routeFlows');

    cy
      .get('.table-list')
      .find('.table-list__item')
      .first()
      .click()
      .wait('@routeFlow');

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

        return fx;
      })
      .routeActionActivity()
      .routeProgramByAction()
      .visit('/flow/1/action/1')
      .wait('@routeFlow')
      .wait('@routeFlowActions');

    cy
      .get('.sidebar')
      .find('[data-name-region] .js-input')
      .should('have.value', 'Test Action');
  });

  specify('flow actions list', function() {
    cy
      .server()
      .routeFlow(fx => {
        fx.data.id = '1';

        fx.data.attributes.name = 'Test Flow';
        fx.data.attributes.updated_at = now.format();
        fx.data.relationships.state.data.id = '33333';

        const flowActions = _.sample(fx.data.relationships.actions.data, 3);

        _.each(flowActions, (action, index) => {
          action.id = `${ index + 1 }`;
        });

        fx.data.relationships.actions.data = flowActions;

        return fx;
      })
      .routeFlowActions(fx => {
        fx.data = _.first(fx.data, 3);

        fx.data[0].id = '1';
        fx.data[0].attributes.name = 'First In List';
        fx.data[0].attributes.due_date = moment.utc().subtract(1, 'day').format();
        fx.data[0].attributes.created_at = moment.utc().subtract(1, 'day').format();
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
        fx.data[1].attributes.due_date = moment.utc().add(1, 'day').format();
        fx.data[1].attributes.created_at = moment.utc().subtract(3, 'day').format();
        fx.data[1].attributes.sequence = 3;
        fx.data[1].relationships.patient.data.id = '1';
        fx.data[1].relationships.state.data.id = '55555';
        fx.data[1].relationships.owner.data = {
          id: '33333',
          type: 'roles',
        };


        fx.data[2].id = '3';
        fx.data[2].attributes.name = 'Second In List';
        fx.data[2].attributes.due_date = moment.utc().add(2, 'day').format();
        fx.data[2].attributes.created_at = moment.utc().subtract(2, 'day').format();
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
        expect($action.find('.action--queued')).to.exist;
        expect($action.find('[data-owner-region')).to.contain('NUR');
        expect($action.find('[data-due-day-region] .is-overdue')).to.exist;
        expect($action.find('[data-attachment-region]')).not.to.be.empty;
      });

    cy
      .get('@actionsList')
      .find('.table-list__item')
      .first()
      .next()
      .should($action => {
        expect($action.find('.action--started')).to.exist;
        expect($action.find('[data-owner-region]')).to.contain('PHS');
      });

    cy
      .get('@actionsList')
      .find('.table-list__item')
      .last()
      .should($action => {
        expect($action.find('.action--done')).to.exist;
        expect($action.find('[data-owner-region]')).to.contain('PHM');
        expect($action.find('[data-owner-region] button')).to.be.disabled;
        expect($action.find('[data-due-day-region] button')).to.be.disabled;
        expect($action.find('[data-due-time-region] button')).to.be.disabled;
      })
      .find('.action--done')
      .click();

    cy
      .get('.picklist')
      .find('.action--started')
      .click();

    cy
      .get('@actionsList')
      .find('.table-list__item')
      .last()
      .as('lastAction')
      .should($action => {
        expect($action.find('.action--started')).to.exist;
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
        fx.data.attributes.updated_at = now.format();

        return fx;
      })
      .routeFlowActions(fx => {
        fx.data = [];

        return fx;
      }, '1')
      .visit('/flow/1')
      .wait('@routeFlow')
      .wait('@routeFlowActions');

    cy
      .get('.patient-flow__empty-list')
      .contains('No Actions');
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
      .routeAction()
      .routeActionActivity()
      .routeProgramByAction()
      .visit('/flow/1')
      .wait('@routeFlow')
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
      .click();

    cy
      .get('.js-menu')
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
