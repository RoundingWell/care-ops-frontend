import _ from 'underscore';
import moment from 'moment';

const now = moment.utc();

context('patient flow page', function() {
  specify('context trail', function() {
    cy
      .server()
      .routeFlow(fx => {
        fx.data.id = '1';

        fx.data.attributes.name = 'Test Flow';
        fx.data.attributes.updated_at = now.format();

        return fx;
      })
      .routeFlowActions(_.identity, '1')
      .routePatientByFlow(fx => {
        fx.data.id = '1';
        fx.data.attributes.first_name = 'Test';
        fx.data.attributes.last_name = 'Patient';

        return fx;
      })
      .route({
        method: 'GET',
        url: '/api/patients/*',
        response: {},
      })
      .as('routePatients')
      .routePatientFields()
      .visit('/flow/1')
      .wait('@routeFlow')
      .wait('@routeFlowActions')
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
  });

  specify('flow sidebar', function() {
    cy
      .server()
      .routeFlow(fx => {
        fx.data.id = '1';

        fx.data.attributes.name = 'Test Flow';
        fx.data.attributes.updated_at = now.format();
        fx.data.relationships.patient.data.id = '1';
        fx.data.relationships.state = {
          data: {
            id: '33333',
            type: 'states',
          },
        };
        fx.data.relationships.owner = {
          data: {
            id: '66666',
            type: 'roles',
          },
        };
        return fx;
      })
      .routeFlowActions(_.identity, '1')
      .routeGroupsBootstrap(_.identity, [
        {
          id: '1',
          name: 'Group One',
        },
      ])
      .routePatientByFlow(fx => {
        fx.data.id = '1';
        fx.data.attributes.first_name = 'Test';
        fx.data.attributes.last_name = 'Patient';

        fx.data.relationships.groups = {
          data: [
            {
              id: '1',
              type: 'groups',
            },
          ],
        };

        return fx;
      })
      .routeFlowActivity()
      .routeProgramByFlow(fx => {
        fx.data.id = '11111';
        fx.data.attributes.name = 'Test Program';

        return fx;
      })
      .routePatient()
      .routePatientFields()
      .routePatientActions()
      .routePatientFlows()
      .routePrograms()
      .routeAllProgramActions()
      .routeAllProgramFlows()
      .visit('/flow/1')
      .wait('@routeFlow')
      .wait('@routeFlowActions')
      .wait('@routePatientByFlow');

    cy
      .get('.patient-flow__header')
      .as('flowHeader')
      .find('.patient-flow__name')
      .click();

    cy
      .get('@flowHeader')
      .should('have.class', 'is-selected')
      .find('[data-state-region] .action--started');

    cy
      .get('@flowHeader')
      .find('[data-owner-region]')
      .contains('SUP');

    cy
      .get('.app-frame__sidebar')
      .as('flowSidebar');

    cy
      .get('@flowSidebar')
      .find('[data-activity-region]')
      .should('contain', 'Clinician McTester (Nurse) added this Flow from the Test Program program')
      .should('contain', 'Clinician McTester (Nurse) changed the Owner to Physician')
      .should('contain', 'Clinician McTester (Nurse) changed State to In Progress')
      .should('contain', 'Clinician McTester (Nurse) changed the Owner to Clinician McTester')
      .should('contain', 'Clinician McTester (Nurse) changed the name of this Flow from evolve portal to cultivate parallelism')
      .should('contain', 'Clinician McTester (Nurse) changed the details of this Flow');

    cy
      .get('@flowSidebar')
      .should('contain', 'Test Flow')
      .find('[data-state-region]')
      .contains('In Progress');

    cy
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/flows/1',
        response: {},
      })
      .as('routePatchFlow');

    cy
      .get('@flowSidebar')
      .find('[data-owner-region]')
      .should('contain', 'Supervisor')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains('Pharmacist')
      .click();

    cy
      .wait('@routePatchFlow')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.owner.data.id).to.equal('33333');
        expect(data.relationships.owner.data.type).to.equal('roles');
      });

    cy
      .get('@flowSidebar')
      .find('[data-owner-region]')
      .should('contain', 'Pharmacist')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__heading')
      .should('contain', 'Group One');

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains('Clinician McTester')
      .click();

    cy
      .wait('@routePatchFlow')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.owner.data.id).to.equal('11111');
        expect(data.relationships.owner.data.type).to.equal('clinicians');
      });

    cy
      .get('@flowHeader')
      .find('[data-owner-region]')
      .contains('Cli');

    cy
      .get('@flowSidebar')
      .find('[data-state-region]')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains('Done')
      .click();

    cy
      .get('.modal--small')
      .should('contain', 'Set Flow to Done?')
      .should('contain', 'There are actions not done on this flow. Are you sure you want to set the flow to done?')
      .find('.js-submit')
      .click();

    cy
      .get('@flowSidebar')
      .find('[data-state-region] .action--done');

    cy
      .get('@flowHeader')
      .find('[data-state-region] .action--done');

    cy
      .get('@flowHeader')
      .find('[data-owner-region] button')
      .should('be.disabled');

    cy
      .get('@flowSidebar')
      .find('[data-owner-region] button')
      .should('be.disabled');

    cy
      .get('.patient-flow__list')
      .find('.table-list__item')
      .first()
      .as('flowAction')
      .find('[data-state-region] button')
      .should('be.disabled');

    cy
      .get('@flowAction')
      .find('[data-owner-region] button')
      .should('be.disabled');

    cy
      .get('@flowAction')
      .find('[data-due-day-region] button')
      .should('be.disabled');

    cy
      .get('@flowAction')
      .find('[data-due-time-region] button')
      .should('be.disabled');

    cy
      .get('@flowSidebar')
      .find('[data-state-region]')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains('In Progress')
      .click();

    cy
      .get('@flowHeader')
      .find('[data-owner-region] button')
      .click();

    cy
      .get('.picklist')
      .contains('Update Action Owner');

    cy
      .get('@flowSidebar')
      .find('[data-owner-region] button')
      .click();

    cy
      .get('.picklist')
      .contains('Update Action Owner');

    cy
      .get('@flowSidebar')
      .find('.js-close')
      .click();

    cy
      .get('@flowHeader')
      .should('not.have.class', 'is-selected');

    cy
      .get('.patient-sidebar');

    cy
      .get('.patient-flow__header')
      .as('flowHeader')
      .find('.patient-flow__name')
      .click();

    cy
      .get('@flowSidebar')
      .find('.js-menu')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains('Delete Flow')
      .click();

    cy
      .route({
        status: 204,
        method: 'DELETE',
        url: '/api/flows/1',
        response: {},
      })
      .as('routeDeleteFlow');

    cy
      .get('.modal--small')
      .find('.js-submit')
      .click();

    cy
      .wait('@routeDeleteFlow');
    cy
      .url()
      .should('contain', 'patient/dashboard/1');
  });

  specify('flow actions list', function() {
    cy
      .server()
      .routeFlow(fx => {
        fx.data.id = '1';

        fx.data.attributes.name = 'Test Flow';
        fx.data.attributes.updated_at = now.format();
        fx.data.relationships.state.data.id = '33333';

        return fx;
      })
      .routeFlowActions(fx => {
        fx.data = _.first(fx.data, 3);

        _.each(fx.data, (flowAction, index) => {
          flowAction.id = index + 1;
          flowAction.relationships.action.data.id = index + 1;
        });

        fx.included = _.first(fx.included, 3);

        _.each(fx.included, (patientAction, index) => {
          patientAction.id = index + 1;
          patientAction.relationships.patient.data.id = '1';
        });

        fx.data[0].attributes.sequence = 0;
        fx.included[0].attributes.name = 'First In List';
        fx.included[0].attributes.due_date = moment.utc().subtract(1, 'day').format();
        fx.included[0].relationships.state.data.id = '22222';
        fx.included[0].relationships.owner.data.id = {
          id: '22222',
          type: 'roles',
        };
        fx.included[0].relationships.form.data = { id: '11111' };

        fx.data[1].attributes.sequence = 2;
        fx.included[1].attributes.name = 'Third In List';
        fx.included[1].attributes.due_date = moment.utc().add(1, 'day').format();
        fx.included[1].relationships.state.data.id = '55555';
        fx.included[1].relationships.owner.data.id = {
          id: '33333',
          type: 'roles',
        };


        fx.data[2].attributes.sequence = 1;
        fx.included[2].attributes.name = 'Second In List';
        fx.included[2].attributes.due_date = moment.utc().add(2, 'day').format();
        fx.included[2].relationships.state.data.id = '33333';
        fx.included[2].relationships.owner.data.id = {
          id: '44444',
          type: 'roles',
        };
      
        fx.included.push({ id: '11111', type: 'forms', attributes: { name: 'Test Form' } });

        return fx;
      }, '1')
      .routePatientByFlow(fx => {
        fx.data.id = '1';
        fx.data.attributes.first_name = 'Test';
        fx.data.attributes.last_name = 'Patient';

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
      .routeProgramByAction()
      .visit('/flow/1')
      .wait('@routeFlow')
      .wait('@routeFlowActions')
      .wait('@routePatientByFlow');

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

    // FIXME: This test does not work at the end of the month
    // cy
    //  .get('@lastAction')
    //  .find('[data-due-day-region]')
    //  .click();
    //
    //
    // cy
    //   .get('.datepicker')
    //   .find('.datepicker__days .is-selected')
    //   .parent()
    //   .next()
    //   .click();

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
      .get('.action-sidebar')
      .find('.js-menu')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains('Delete Action')
      .click()
      .wait('@routeDeleteFlowAction');

    // cy
    // .get('@actionsList')
    // .should('have.length', 2);
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
      .routePatientByFlow(fx => {
        fx.data.id = '1';
        fx.data.attributes.first_name = 'Test';
        fx.data.attributes.last_name = 'Patient';

        return fx;
      })
      .visit('/flow/1')
      .wait('@routeFlow')
      .wait('@routeFlowActions')
      .wait('@routePatientByFlow');

    cy
      .get('.workflows__empty-list')
      .contains('No Actions');
  });
});
