import moment from 'moment';
import _ from 'underscore';

const now = moment.utc();

context('flow sidebar', function() {
  specify('display flow sidebar', function() {
    cy
      .server()
      .routeFlow(fx => {
        const flowActions = _.sample(fx.data.relationships.actions.data, 3);
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

        _.each(flowActions, (action, index) => {
          action.id = `${ index + 1 }`;
        });

        fx.data.relationships.actions.data = flowActions;

        return fx;
      })
      .routeFlowActions(fx => {
        fx.data = _.sample(fx.data, 3);
        fx.included = _.sample(fx.included, 3);

        _.each(fx.data, (action, index) => {
          action.id = `${ index + 1 }`;
          action.relationships.state.data.id = '33333';
          action.attributes.created_at = moment.utc().subtract(index + 1, 'day').format();
        });

        return fx;
      }, '1')
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
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/flows/1',
        response: {},
      })
      .as('routePatchFlow');

    cy
      .get('@flowHeader')
      .should('have.class', 'is-selected')
      .find('[data-state-region] .action--started')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains('To Do')
      .click()
      .wait('@routePatchFlow')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.state.data.id).to.equal('22222');
      });

    cy
      .get('@flowHeader')
      .find('[data-owner-region]')
      .contains('SUP')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains('Nurse')
      .click()
      .wait('@routePatchFlow')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.owner.data.id).to.equal('22222');
      });

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
      .contains('To Do');

    cy
      .get('@flowSidebar')
      .find('[data-owner-region]')
      .should('contain', 'Nurse')
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
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/actions/*',
        response: {},
      })
      .as('routePatchAction');

    cy
      .get('.patient-flow__list')
      .find('.table-list__item')
      .each(($el, index) => {
        const el = cy.wrap($el);

        el
          .find('[data-state-region]')
          .click();

        cy
          .get('.picklist')
          .find('.picklist__item')
          .contains('Done')
          .click();
      });

    cy
      .get('@flowHeader')
      .find('[data-state-region]')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains('Done')
      .click();

    cy
      .get('.modal--small')
      .should('not.exist');

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
});
