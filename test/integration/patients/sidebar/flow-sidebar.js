import _ from 'underscore';

import { testTs, testTsSubtract } from 'helpers/test-timestamp';
import { testDateSubtract } from 'helpers/test-date';
import { getRelationship } from 'helpers/json-api';

import { getActivity } from 'support/api/events';

import { workspaceOne } from 'support/api/workspaces';


context('flow sidebar', function() {
  specify('display flow sidebar', function() {
    cy
      .routesForPatientDashboard()
      .routeFlow(fx => {
        const flowActions = _.sample(fx.data.relationships.actions.data, 3);
        fx.data.id = '1';

        fx.data.attributes.name = 'Test Flow';
        fx.data.attributes.updated_at = testTs();
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
            type: 'teams',
          },
        };

        _.each(flowActions, (action, index) => {
          action.id = `${ index + 1 }`;
        });

        fx.data.relationships.actions.data = flowActions;

        fx.data.meta.progress.complete = 0;
        fx.data.meta.progress.total = 3;

        fx.included.push({
          id: '1',
          attributes: {
            first_name: 'First',
            last_name: 'Last',
            birth_date: testDateSubtract(10, 'years'),
            sex: 'f',
          },
          type: 'patients',
          relationships: {
            workspaces: { data: [{ id: workspaceOne.id, type: 'workspaces' }] },
          },
        });

        fx.included.push({
          id: '11111',
          type: 'programs',
          attributes: {
            name: 'Test Program',
          },
        });

        return fx;
      })
      .routePatientByFlow()
      .routeFlowActions(fx => {
        fx.data = _.sample(fx.data, 3);
        fx.included = _.reject(fx.included, { type: 'flows' });
        fx.included = _.reject(fx.included, { type: 'patients' });

        _.each(fx.data, (action, index) => {
          action.id = `${ index + 1 }`;
          action.relationships.flow = getRelationship('1', 'flows');
          action.relationships.state.data.id = '33333';
          action.attributes.created_at = testTsSubtract(index + 1);
        });

        return fx;
      })
      .routeFlowActivity(fx => {
        fx.data[0].attributes.source = 'api';

        fx.data = [
          ...fx.data,
          getActivity({
            event_type: 'FlowProgramStarted',
            source: 'api',
          }, {
            program: getRelationship('11111', 'programs'),
          }),
          getActivity({
            event_type: 'FlowTeamAssigned',
            source: 'api',
          }, {
            team: getRelationship('44444', 'teams'),
          }),
          getActivity({
            event_type: 'FlowStateUpdated',
            source: 'api',
          }, {
            state: getRelationship('33333', 'states'),
            source: 'api',
          }),
          getActivity({
            event_type: 'FlowClinicianAssigned',
            source: 'api',
          }, {
            clinician: getRelationship('11111', 'clinicians'),
          }),
          getActivity({
            event_type: 'FlowNameUpdated',
            source: 'api',
            previous: 'evolve portal',
            value: 'cultivate parallelism',
          }),
          getActivity({
            event_type: 'FlowDetailsUpdated',
            source: 'api',
          }),
          getActivity({
            event_type: 'FlowProgramStarted',
            source: 'system',
          }, {
            program: getRelationship('11111', 'programs'),
          }),
          getActivity({
            event_type: 'FlowTeamAssigned',
            source: 'system',
          }, {
            team: getRelationship('44444', 'teams'),
          }),
          getActivity({
            event_type: 'FlowStateUpdated',
            source: 'system',
          }, {
            state: getRelationship('33333', 'states'),
            source: 'system',
          }),
          getActivity({
            event_type: 'FlowClinicianAssigned',
            source: 'system',
          }, {
            clinician: getRelationship('11111', 'clinicians'),
          }),
          getActivity({
            event_type: 'FlowNameUpdated',
            source: 'system',
            previous: 'evolve portal',
            value: 'cultivate parallelism',
          }),
          getActivity({
            event_type: 'FlowDetailsUpdated',
            source: 'system',
          }),
        ];

        return fx;
      })
      .routeWorkspaceClinicians(fx => {
        fx.data[1].relationships.team.data.id = '11111';
        return fx;
      })
      .visit('/flow/1')
      .wait('@routeFlow')
      .wait('@routePatientByFlow')
      .wait('@routeFlowActions');

    cy
      .get('.patient-flow__header')
      .as('flowHeader')
      .find('.patient-flow__name')
      .click();

    cy
      .intercept('PATCH', '/api/flows/1', {
        statusCode: 204,
        body: {},
      })
      .as('routePatchFlow');

    cy
      .get('@flowHeader')
      .should('have.class', 'is-selected')
      .find('[data-state-region] .fa-circle-dot')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
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
      .find('.js-picklist-item')
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
      .wait('@routeFlowActivity')
      .get('@flowSidebar')
      .find('[data-activity-region]')
      // source = 'api' activity events
      .should('contain', 'Clinician McTester (Nurse) added this flow from the Test Program program')
      .should('contain', 'Clinician McTester (Nurse) changed the owner to Physician')
      .should('contain', 'Clinician McTester (Nurse) changed State to In Progress')
      .should('contain', 'Clinician McTester (Nurse) changed the Owner to Clinician McTester')
      .should('contain', 'Clinician McTester (Nurse) updated the name of this flow from evolve portal to cultivate parallelism')
      .should('contain', 'Clinician McTester (Nurse) updated the details of this flow')
      // source = 'system' activity events
      .should('contain', 'Flow added from the Test Program program')
      .should('contain', 'Owner changed to Physician')
      .should('contain', 'Clinician McTester (Nurse) changed State to In Progress')
      .should('contain', 'Owner (Nurse) changed to Clinician McTester')
      .should('contain', 'Flow name updated from evolve portal to cultivate parallelism')
      .should('contain', 'Flow details updated');

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
      .find('.js-picklist-item')
      .contains('Coordinator')
      .click();

    cy
      .wait('@routePatchFlow')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.owner.data.id).to.equal('11111');
        expect(data.relationships.owner.data.type).to.equal('teams');
      });

    cy
      .get('@flowSidebar')
      .find('[data-owner-region]')
      .should('contain', 'Coordinator')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__heading')
      .should('contain', 'Workspace One');

    cy
      .get('.picklist')
      .find('.js-picklist-item')
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
      .find('.js-picklist-item')
      .contains('Done')
      .click();

    cy
      .get('.modal--small')
      .should('contain', 'Set Flow to Done?')
      .find('.js-submit')
      .click();

    cy
      .get('@flowSidebar')
      .find('[data-state-region]')
      .contains('Done');

    cy
      .get('@flowHeader')
      .find('[data-state-region] .fa-circle-check');

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
      .should('not.exist');

    cy
      .get('@flowAction')
      .find('[data-owner-region] button')
      .should('not.exist');

    cy
      .get('@flowAction')
      .find('[data-due-date-region] button')
      .should('not.exist');

    cy
      .get('@flowAction')
      .find('[data-due-time-region] button')
      .should('not.exist');

    cy
      .get('@flowSidebar')
      .find('[data-state-region]')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('In Progress')
      .click();

    cy
      .get('@flowHeader')
      .find('[data-owner-region] button')
      .click();

    cy
      .get('.picklist')
      .contains('Update Owner');

    cy
      .get('@flowSidebar')
      .find('[data-owner-region] button')
      .click();

    cy
      .get('.picklist')
      .contains('Update Owner');

    cy
      .get('@flowSidebar')
      .find('.js-close')
      .click();

    cy
      .get('@flowHeader')
      .should('not.have.class', 'is-selected');

    cy
      .intercept('PATCH', '/api/actions/*', {
        statusCode: 204,
        body: {},
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
          .find('.js-picklist-item')
          .contains('Done')
          .click();
      });

    cy
      .get('@flowHeader')
      .find('[data-state-region]')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('Done')
      .click();

    cy
      .get('.modal--small')
      .should('not.exist');

    cy
      .get('.patient-sidebar');

    cy
      .get('.patient-flow__header')
      .find('.patient-flow__name')
      .click();

    cy
      .get('@flowSidebar')
      .find('[data-menu-region]')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('Delete Flow')
      .click();

    cy
      .intercept('DELETE', '/api/flows/1', {
        statusCode: 403,
        body: {
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
      .as('routeDeleteFlowFailure');

    cy
      .get('.modal--small')
      .find('.js-submit')
      .click();

    cy
      .wait('@routeDeleteFlowFailure');

    cy
      .get('.alert-box')
      .should('contain', 'Insufficient permissions to delete action');

    cy
      .get('@flowSidebar')
      .find('[data-menu-region]')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('Delete Flow')
      .click();

    cy
      .intercept('DELETE', '/api/flows/1', {
        statusCode: 204,
        body: {},
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

  specify('done actions required', function() {
    cy
      .routesForPatientDashboard()
      .routeSettings(fx => {
        const requiredDoneFlow = _.find(fx.data, setting => setting.id === 'require_done_flow');
        requiredDoneFlow.attributes.value = true;

        return fx;
      })
      .routeFlow(fx => {
        const flowActions = _.sample(fx.data.relationships.actions.data, 3);
        fx.data.id = '1';

        fx.data.attributes.name = 'Test Flow';
        fx.data.attributes.updated_at = testTs();
        fx.data.relationships.patient.data.id = '1';
        fx.data.relationships.state = {
          data: {
            id: '33333',
            type: 'states',
          },
        };

        _.each(flowActions, (action, index) => {
          action.id = `${ index + 1 }`;
        });

        fx.data.relationships.actions.data = flowActions;

        fx.data.meta.progress.complete = 0;
        fx.data.meta.progress.total = 3;

        fx.included.push({
          id: '1',
          attributes: {
            first_name: 'First',
            last_name: 'Last',
          },
          type: 'patients',
        });


        return fx;
      })
      .routePatientByFlow()
      .routeFlowActions(fx => {
        fx.data = _.sample(fx.data, 3);
        fx.included = _.reject(fx.included, { type: 'flows' });
        fx.included.push({
          id: '11111',
          type: 'programs',
          attributes: { name: 'Test Program' },
        });
        _.each(fx.data, (action, index) => {
          action.id = `${ index + 1 }`;
          action.relationships.state.data.id = '33333';
          action.attributes.created_at = testTsSubtract(index + 1);
        });

        return fx;
      })
      .routeFlowActivity()
      .visit('/flow/1')
      .wait('@routeFlow')
      .wait('@routePatientByFlow')
      .wait('@routeFlowActions');

    cy
      .get('.patient-flow__header')
      .find('.patient-flow__name')
      .click();

    cy
      .get('.app-frame__sidebar')
      .as('flowSidebar');

    cy
      .get('@flowSidebar')
      .find('[data-state-region]')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('Done')
      .click();

    cy
      .get('.modal--small')
      .should('contain', 'Flow Actions Must Be Done')
      .find('.js-submit')
      .click();
  });

  specify('flow with work:owned: permissions', function() {
    cy
      .routeCurrentClinician(fx => {
        fx.data.relationships.role = { data: { id: '66666' } };
        return fx;
      })
      .routesForPatientDashboard()
      .routeFlow(fx => {
        const flowActions = _.sample(fx.data.relationships.actions.data, 3);
        fx.data.id = '1';

        fx.data.attributes.name = 'Test Flow';
        fx.data.attributes.updated_at = testTs();
        fx.data.relationships.patient.data.id = '1';
        fx.data.relationships.state = {
          data: {
            id: '22222',
            type: 'states',
          },
        };
        fx.data.relationships.owner = {
          data: {
            id: '11111',
            type: 'clinicians',
          },
        };

        _.each(flowActions, (action, index) => {
          action.id = `${ index + 1 }`;
        });

        fx.data.relationships.actions.data = flowActions;

        fx.data.meta.progress.complete = 0;
        fx.data.meta.progress.total = 3;

        return fx;
      })
      .routePatientByFlow()
      .routeFlowActions(fx => {
        fx.data = _.sample(fx.data, 3);
        fx.included = _.reject(fx.included, { type: 'flows' });
        fx.included = _.reject(fx.included, { type: 'patients' });

        _.each(fx.data, (action, index) => {
          action.id = `${ index + 1 }`;
          action.relationships.state.data.id = '33333';
        });

        return fx;
      })
      .routeFlowActivity()
      .visit('/flow/1')
      .wait('@routeFlow')
      .wait('@routePatientByFlow')
      .wait('@routeFlowActions');

    cy
      .get('.patient-flow__header')
      .as('flowHeader')
      .find('.patient-flow__name')
      .click();

    cy
      .intercept('PATCH', '/api/flows/1', {
        statusCode: 204,
        body: {},
      })
      .as('routePatchFlow');

    cy
      .get('.app-frame__sidebar')
      .as('flowSidebar')
      .find('[data-menu-region]')
      .should('not.be.empty');

    cy
      .get('@flowSidebar')
      .find('[data-owner-region]')
      .contains('Clinician')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('Nurse')
      .click()
      .wait('@routePatchFlow');

    cy
      .get('.app-frame__sidebar')
      .as('flowSidebar')
      .find('[data-owner-region]')
      .find('button')
      .should('not.exist');

    cy
      .get('@flowSidebar')
      .find('[data-state-region]')
      .find('button')
      .should('not.exist');

    cy
      .get('@flowSidebar')
      .find('[data-menu-region]')
      .should('be.empty');

    cy
      .get('[data-permission-region]')
      .should('contain', 'You are not able to change settings on this flow.');
  });

  specify('flow with work:team:manage permission', function() {
    cy
      .routesForPatientDashboard()
      .routeCurrentClinician(fx => {
        fx.data.relationships.role = { data: { id: '77777' } };
        fx.data.relationships.team = { data: { id: '11111', type: 'teams' } };

        return fx;
      })
      .routeWorkspaceClinicians(fx => {
        fx.data = _.first(fx.data, 2);

        const nonTeamMemberClinician = fx.data[1];
        nonTeamMemberClinician.attributes.name = 'Non Team Member';
        nonTeamMemberClinician.relationships.team.data.id = '22222';

        return fx;
      })
      .routeFlow(fx => {
        fx.data.id = '1';
        fx.data.attributes.name = 'Owned by another team';
        fx.data.relationships.state = { data: { id: '33333', type: 'states' } };
        fx.data.relationships.owner = { data: { id: '22222', type: 'teams' } };
        fx.data.relationships.patient.data.id = '1';

        fx.included.push({
          id: '1',
          attributes: {
            first_name: 'Test',
            last_name: 'Patient',
          },
          type: 'patients',
        });

        return fx;
      })
      .routePatientFlows(fx => {
        fx.data = _.sample(fx.data, 2);

        fx.data[0].id = '1';
        fx.data[0].attributes.name = 'Owned by another team';
        fx.data[0].attributes.updated_at = testTsSubtract(1);
        fx.data[0].relationships.state = { data: { id: '33333' } };
        fx.data[0].relationships.owner = { data: { id: '22222', type: 'teams' } };

        fx.data[1].id = '2';
        fx.data[1].attributes.name = 'Owned by non team member';
        fx.data[1].attributes.updated_at = testTsSubtract(2);
        fx.data[1].relationships.state = { data: { id: '33333' } };
        fx.data[1].relationships.owner = { data: { id: '22222', type: 'clinicians' } };

        return fx;
      })
      .routePatientActions(fx => {
        fx.data = [];

        return fx;
      })
      .routeFlowActions(fx => {
        fx.data = [];

        return fx;
      })
      .routePatientByFlow()
      .routeFlowActivity()
      .visit('/flow/1')
      .wait('@routeFlow')
      .wait('@routePatientByFlow')
      .wait('@routeFlowActions');

    cy
      .get('.patient-flow__header')
      .find('.patient-flow__name')
      .click();

    cy
      .get('[data-permission-region]')
      .should('contain', 'You are not able to change settings on this flow.');

    cy
      .get('.patient-flow__context-trail .js-patient')
      .click()
      .wait('@routePatient')
      .wait('@routePatientActions')
      .wait('@routePatientFlows');

    cy
      .routeFlow(fx => {
        fx.data.id = '1';
        fx.data.attributes.name = 'Owned by non team member';
        fx.data.relationships.state = { data: { id: '33333', type: 'states' } };
        fx.data.relationships.owner = { data: { id: '22222', type: 'clinicians' } };
        fx.data.relationships.patient.data.id = '1';

        fx.included.push({
          id: '1',
          attributes: {
            first_name: 'Test',
            last_name: 'Patient',
          },
          type: 'patients',
        });

        return fx;
      });

    cy
      .get('.patient__list')
      .find('.table-list__item')
      .last()
      .find('.patient__action-name')
      .click()
      .wait('@routeFlow')
      .wait('@routePatientByFlow')
      .wait('@routeFlowActions');

    cy
      .get('.patient-flow__header')
      .find('.patient-flow__name')
      .click();

    cy
      .intercept('PATCH', '/api/flows/1', {
        statusCode: 204,
        body: {},
      })
      .as('routePatchFlow');

    cy
      .get('[data-permission-region]')
      .should('contain', 'You are not able to change settings on this flow.');
  });

  specify('flow with work:authored:delete permission', function() {
    cy
      .routesForPatientDashboard()
      .routeCurrentClinician(fx => {
        fx.data.relationships.role = { data: { id: '77777' } };
        fx.data.relationships.team = { data: { id: '11111', type: 'teams' } };

        return fx;
      })
      .routeFlow(fx => {
        fx.data.id = '1';
        fx.data.attributes.name = 'Owned by team member';
        fx.data.relationships.state = { data: { id: '33333', type: 'states' } };
        fx.data.relationships.owner = { data: { id: '11111', type: 'teams' } };
        fx.data.relationships.patient.data.id = '1';
        fx.data.relationships.author = { data: { id: '11111', type: 'clinicians' } };

        fx.included.push({
          id: '1',
          attributes: {
            first_name: 'Test',
            last_name: 'Patient',
          },
          type: 'patients',
        });

        return fx;
      })
      .routePatientByFlow()
      .routeFlowActions(fx => {
        fx.data = _.sample(fx.data, 3);
        fx.included = _.reject(fx.included, { type: 'flows' });
        fx.included = _.reject(fx.included, { type: 'patients' });

        _.each(fx.data, (action, index) => {
          action.id = `${ index + 1 }`;
          action.relationships.state.data.id = '33333';
        });

        return fx;
      })
      .routeFlowActivity()
      .visit('/flow/1')
      .wait('@routeFlow')
      .wait('@routePatientByFlow')
      .wait('@routeFlowActions');

    cy
      .get('.patient-flow__header')
      .find('.patient-flow__name')
      .click();

    cy
      .get('.app-frame__sidebar')
      .as('flowSidebar')
      .find('[data-menu-region]')
      .should('not.be.empty');
  });
});
