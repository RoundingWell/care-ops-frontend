import _ from 'underscore';
import dayjs from 'dayjs';

import formatDate from 'helpers/format-date';
import { testTs, testTsSubtract } from 'helpers/test-timestamp';
import { testDate, testDateSubtract } from 'helpers/test-date';
import { getRelationship } from 'helpers/json-api';
import { getActivity } from 'support/api/events';
import stateColors from 'helpers/state-colors';

import { workspaceOne } from 'support/api/workspaces';

context('action sidebar', function() {
  specify('display new action sidebar', function() {
    cy
      .routesForPatientAction()
      .routePatient(fx => {
        fx.data.id = '1';
        return fx;
      })
      .routePatientActions(fx => {
        _.each(fx.data, action => {
          action.relationships.state.data.id = '22222';
        });

        return fx;
      })
      .visit('/patient/1/action')
      .wait('@routePatient');

    cy
      .get('.sidebar')
      .find('[data-name-region] .js-input')
      .should('be.focused')
      .should('have.attr', 'placeholder', 'New Action');

    cy
      .get('.sidebar')
      .find('[data-save-region]')
      .contains('Save')
      .should('be.disabled');

    cy
      .get('.sidebar')
      .find('[data-state-region]')
      .contains('To Do')
      .should('be.disabled');

    cy
      .get('.sidebar')
      .find('[data-owner-region]')
      .contains('Clinician McTester')
      .should('be.disabled');

    cy
      .get('.sidebar')
      .find('[data-due-date-region]')
      .contains('Select Date')
      .should('be.disabled');

    cy
      .get('.sidebar')
      .find('[data-due-time-region]')
      .contains('Time')
      .should('be.disabled');

    cy
      .get('.sidebar')
      .find('[data-duration-region]')
      .contains('Select Duration')
      .should('be.disabled');

    cy
      .get('[data-activity-region]')
      .should('be.empty');

    cy
      .get('.sidebar')
      .should('not.contain', 'Form');

    cy
      .get('.sidebar')
      .find('[data-name-region] .js-input')
      .type('Test Name');

    cy
      .get('.sidebar')
      .find('[data-save-region] .js-cancel')
      // Need force because Cypress does not recognize the element is typeable
      .type('{enter}', { force: true });

    cy
      .get('.sidebar')
      .should('not.exist');

    cy
      .get('[data-add-workflow-region]')
      .contains('Add')
      .click();

    cy
      .get('.picklist')
      .contains('New Action')
      .click();

    cy
      .get('.sidebar')
      .find('[data-menu-region]')
      .click();

    cy
      .get('.picklist')
      .contains('Delete Action')
      .click();

    cy
      .get('[data-add-workflow-region]')
      .contains('Add')
      .click();

    cy
      .get('.picklist')
      .contains('New Action')
      .click();

    cy
      .get('.sidebar')
      .find('[data-name-region] .js-input')
      .should('be.empty')
      .type('   ');

    cy
      .get('.sidebar')
      .find('[data-save-region]')
      .contains('Save')
      .should('be.disabled');

    cy
      .get('.sidebar')
      .find('[data-name-region] .js-input')
      .type('{backspace}{backspace}{backspace}');

    cy
      .get('.sidebar')
      .find('[data-name-region] .js-input')
      .should('be.empty')
      .type('a{backspace}')
      .type('Test{enter} Name');

    cy
      .intercept('POST', '/api/patients/1/relationships/actions*', {
        statusCode: 201,
        body: {
          data: {
            id: '1',
            attributes: {
              name: 'Test Name',
              updated_at: testTs(),
            },
          },
        },
      })
      .as('routePostAction');

    cy
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.attributes.name = 'Test Name';
        fx.data.attributes.updated_at = testTs();
        fx.data.relationships.state.data.id = '22222';
        return fx;
      });

    cy
      .get('.sidebar')
      .find('[data-details-region] .js-input')
      .type('a{backspace}')
      .type('Test{enter} Details')
      .tab()
      .typeEnter();

    cy
      .wait('@routePostAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.state.data.id).to.equal('22222');
        expect(data.relationships.owner.data.id).to.equal('11111');
        expect(data.relationships.owner.data.type).to.equal('clinicians');
        expect(data.id).to.not.be.null;
        expect(data.attributes.name).to.equal('Test Name');
        expect(data.attributes.details).to.equal('Test\n Details');
        expect(data.attributes.due_date).to.be.null;
        expect(data.attributes.due_time).to.be.null;
        expect(data.attributes.duration).to.equal(0);
      });

    cy
      .get('.sidebar')
      .find('[data-save-region]')
      .should('be.empty');

    cy
      .get('.sidebar__footer')
      .contains('Updated')
      .next()
      .should('contain', formatDate(testTs(), 'AT_TIME'));

    cy
      .get('.sidebar')
      .find('[data-menu-region]')
      .click();

    cy
      .intercept('DELETE', '/api/actions/1*', {
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
      .as('routeDeleteActionFailure');

    cy
      .get('.picklist')
      .contains('Delete Action')
      .click();

    cy
      .wait('@routeDeleteActionFailure');

    cy
      .get('.alert-box')
      .should('contain', 'Insufficient permissions to delete action');

    cy
      .get('.patient__list')
      .find('.table-list__item')
      .contains('Test Name');

    cy
      .get('.sidebar')
      .find('[data-menu-region]')
      .click();

    cy
      .intercept('DELETE', '/api/actions/1*', {
        statusCode: 204,
        body: {},
      })
      .as('routeDeleteAction');

    cy
      .get('.picklist')
      .contains('Delete Action')
      .click();

    cy
      .wait('@routeDeleteAction')
      .itsUrl()
      .its('pathname')
      .should('contain', 'api/actions/1');

    cy
      .get('.sidebar')
      .should('not.exist');

    cy
      .get('.patient__list')
      .find('.table-list__item')
      .contains('Test Name')
      .should('not.exist');
  });

  specify('display action sidebar', function() {
    const testTime = dayjs(testDate()).hour(12).valueOf();

    const actionData = {
      id: '1',
      attributes: {
        name: 'Name',
        details: 'Details',
        duration: 5,
        due_date: testDateSubtract(2),
        due_time: '06:01:00',
        updated_at: testTs(),
      },
      relationships: {
        owner: { data: null },
        state: { data: { id: '22222' } },
      },
    };

    cy
      .routesForPatientAction()
      .routeTeams(fx => {
        fx.data.push({
          id: 'not-included',
          type: 'teams',
          attributes: {
            name: 'Not Included',
            abbr: 'NOT',
          },
        });
        return fx;
      })
      .routeWorkspaceClinicians(fx => {
        const clinician = fx.data[1];

        clinician.attributes.name = 'Another Clinician';
        clinician.relationships.team.data.id = '11111';

        return fx;
      })
      .routeAction(fx => {
        fx.data = actionData;

        fx.data.relationships.owner.data = {
          id: '11111',
          type: 'clinicians',
        };
        fx.data.relationships.patient = {
          data: {
            id: '1',
            type: 'patients',
          },
        };
        return fx;
      })
      .routePatientActions(fx => {
        fx.data[0] = actionData;
        fx.data[0].relationships.owner.data = {
          id: '11111',
          type: 'clinicians',
        };

        fx.included = _.reject(fx.included, { type: 'patients' });

        return fx;
      })
      .routePatientFlows(fx => {
        fx.included = _.reject(fx.included, { type: 'patients' });

        return fx;
      })
      .routeActionActivity(fx => {
        fx.data[0].attributes.date = testTs();
        fx.data[0].attributes.source = 'api';

        fx.data = [
          ...fx.data,
          getActivity({
            event_type: 'ActionClinicianAssigned',
            source: 'api',
          }, {
            clinician: getRelationship('22222', 'clinicians'),
          }),
          getActivity({
            event_type: 'ActionDetailsUpdated',
            source: 'api',
          }),
          getActivity({
            event_type: 'ActionDueDateUpdated',
            source: 'api',
            previous: null,
            value: '2019-09-10',
          }),
          getActivity({
            event_type: 'ActionDueDateUpdated',
            source: 'api',
            previous: null,
            value: null,
          }),
          getActivity({
            event_type: 'ActionDurationUpdated',
            source: 'api',
            previous: 0,
            value: 10,
          }),
          getActivity({
            event_type: 'ActionDurationUpdated',
            source: 'api',
            previous: 0,
            value: null,
          }),
          getActivity({
            event_type: 'ActionNameUpdated',
            source: 'api',
            previous: 'New Action',
            value: 'New Action Name Updated',
          }),
          getActivity({
            event_type: 'ActionTeamAssigned',
            source: 'api',
          }, {
            team: getRelationship('44444', 'teams'),
          }),
          getActivity({
            event_type: 'ActionStateUpdated',
            source: 'api',
          }, {
            state: getRelationship('55555', 'states'),
          }),
          getActivity({
            event_type: 'ActionFormUpdated',
            source: 'api',
          }, {
            form: getRelationship('11111', 'forms'),
          }),
          getActivity({
            event_type: 'ActionFormRemoved',
            source: 'api',
          }, {
            form: getRelationship('11111', 'forms'),
          }),
          getActivity({
            event_type: 'ActionFormResponded',
            source: 'api',
          }, {
            form: getRelationship('11111', 'forms'),
          }),
          getActivity({
            event_type: 'ActionDueTimeUpdated',
            source: 'api',
            previous: null,
            value: '11:12:13',
          }),
          getActivity({
            event_type: 'ActionDueTimeUpdated',
            source: 'api',
            previous: null,
            value: null,
          }),
          getActivity({
            event_type: 'ActionSharingUpdated',
            source: 'api',
            value: 'sent',
          }, {
            recipient: getRelationship('1', 'patients'),
          }),
          getActivity({
            event_type: 'ActionSharingUpdated',
            source: 'api',
            value: 'canceled',
          }, {
            recipient: getRelationship('1', 'patients'),
          }),
          getActivity({
            event_type: 'ActionFormResponded',
            source: 'api',
          }, {
            editor: getRelationship(),
            recipient: getRelationship('1', 'patients'),
            form: getRelationship('11111', 'forms'),
          }),
          getActivity({
            event_type: 'ActionSharingUpdated',
            source: 'api',
            value: 'pending',
          }, {
            recipient: getRelationship('1', 'patients'),
          }),
          getActivity({
            event_type: 'ActionCreated',
            source: 'system',
          }, {
            editor: getRelationship('22222', 'clinicians'),
          }),
          getActivity({
            event_type: 'ActionClinicianAssigned',
            source: 'system',
          }, {
            clinician: getRelationship('22222', 'clinicians'),
          }),
          getActivity({
            event_type: 'ActionDetailsUpdated',
            source: 'system',
          }),
          getActivity({
            event_type: 'ActionDueDateUpdated',
            source: 'system',
            previous: null,
            value: '2019-09-10',
          }),
          getActivity({
            event_type: 'ActionDueDateUpdated',
            source: 'system',
            previous: null,
            value: null,
          }),
          getActivity({
            event_type: 'ActionDurationUpdated',
            source: 'system',
            previous: 0,
            value: 10,
          }),
          getActivity({
            event_type: 'ActionDurationUpdated',
            source: 'system',
            previous: 0,
            value: null,
          }),
          getActivity({
            event_type: 'ActionNameUpdated',
            source: 'system',
            previous: 'New Action',
            value: 'New Action Name Updated',
          }),
          getActivity({
            event_type: 'ActionTeamAssigned',
            source: 'system',
          }, {
            team: getRelationship('44444', 'teams'),
          }),
          getActivity({
            event_type: 'ActionStateUpdated',
            source: 'system',
          }, {
            state: getRelationship('55555', 'states'),
          }),
          getActivity({
            event_type: 'ActionFormUpdated',
            source: 'system',
          }, {
            form: getRelationship('11111', 'forms'),
          }),
          getActivity({
            event_type: 'ActionFormRemoved',
            source: 'system',
          }, {
            form: getRelationship('11111', 'forms'),
          }),
          getActivity({
            event_type: 'ActionFormResponded',
            source: 'system',
          }, {
            editor: getRelationship(),
            recipient: getRelationship('1', 'patients'),
            form: getRelationship('11111', 'forms'),
          }),
          getActivity({
            event_type: 'ActionFormResponded',
            source: 'system',
          }, {
            form: getRelationship('11111', 'forms'),
          }),
          getActivity({
            event_type: 'ActionDueTimeUpdated',
            source: 'system',
            previous: null,
            value: '11:12:13',
          }),
          getActivity({
            event_type: 'ActionDueTimeUpdated',
            source: 'system',
            previous: null,
            value: null,
          }),
          getActivity({
            event_type: 'ActionSharingUpdated',
            source: 'system',
            value: 'sent',
          }, {
            recipient: getRelationship('1', 'patients'),
          }),
          getActivity({
            event_type: 'ActionSharingUpdated',
            source: 'system',
            value: 'canceled',
          }, {
            recipient: getRelationship('1', 'patients'),
          }),
          getActivity({
            event_type: 'ActionSharingUpdated',
            source: 'system',
            value: 'pending',
          }, {
            recipient: getRelationship('1', 'patients'),
          }),
        ];

        return fx;
      })
      .routePatient(fx => {
        fx.data.id = '1';
        fx.data.attributes.first_name = 'Test';
        fx.data.attributes.last_name = 'Patient';
        fx.data.relationships.workspaces = {
          data: [
            {
              id: workspaceOne.id,
              type: 'workspaces',
            },
          ],
        };

        return fx;
      })
      .visitOnClock('/patient/1/action/1', { now: testTime, functionNames: ['Date'] })
      .wait('@routePatientActions')
      .wait('@routePatientFlows')
      .wait('@routeAction')
      .wait('@routeActionActivity')
      .wait('@routePatient');

    cy
      .get('.sidebar')
      .find('[data-save-region]')
      .should('be.empty');

    cy
      .get('.sidebar')
      .find('[data-name-region] .js-input')
      .clear();

    cy
      .get('.sidebar')
      .find('[data-save-region]')
      .contains('Save')
      .should('be.disabled');

    cy
      .get('.sidebar')
      .find('[data-name-region] .js-input')
      .type('testing name');

    cy
      .get('.sidebar')
      .find('[data-details-region] .js-input')
      .clear();

    cy
      .intercept('PATCH', '/api/actions/1', {
        statusCode: 204,
        body: {},
      })
      .as('routePatchAction');

    cy
      .get('.sidebar')
      .find('[data-save-region]')
      .contains('Save')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships).to.be.undefined;
        expect(data.id).to.equal('1');
        expect(data.attributes.name).to.equal('testing name');
        expect(data.attributes.details).to.equal('');
        expect(data.attributes.due_date).to.not.exist;
        expect(data.attributes.due_time).to.not.exist;
        expect(data.attributes.duration).to.not.exist;
      });

    cy
      .get('.sidebar')
      .find('[data-save-region]')
      .should('be.empty');

    cy
      .get('.sidebar')
      .find('[data-name-region] .js-input')
      .type('cancel this text');

    cy
      .get('.sidebar')
      .find('[data-save-region]')
      .contains('Cancel')
      .click();

    cy
      .get('.sidebar')
      .find('[data-name-region] .js-input')
      .should('have.value', 'testing name');

    cy
      .get('.sidebar')
      .find('[data-save-region]')
      .should('be.empty');

    cy
      .get('.sidebar')
      .find('[data-state-region]')
      .contains('To Do')
      .click();

    cy
      .get('.picklist')
      .contains('In Progress')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.state.data.id).to.equal('33333');
      });

    cy
      .get('.sidebar')
      .find('[data-owner-region]')
      .contains('Clinician McTester')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__heading')
      .should('contain', 'Workspace One');

    cy
      .get('.picklist')
      .should('not.contain', 'Not Included')
      .contains('Nurse NUR')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.owner.data.id).to.equal('22222');
        expect(data.relationships.owner.data.type).to.equal('teams');
      });

    cy
      .get('.sidebar')
      .find('[data-owner-region]')
      .contains('Nurse')
      .click();

    cy
      .get('.picklist')
      .contains('Clinician McTester')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.owner.data.id).to.equal('11111');
        expect(data.relationships.owner.data.type).to.equal('clinicians');
      });

    cy
      .get('.sidebar')
      .find('[data-due-time-region]')
      .contains('6:01 AM')
      .click();

    cy
      .get('.picklist')
      .contains('Clear Time')
      .click();

    cy
      .wait('@routePatchAction');

    cy
      .get('.sidebar')
      .find('[data-due-time-region]')
      .should('contain', 'Time')
      .find('.is-overdue')
      .should('not.exist');

    cy
      .get('.sidebar')
      .find('[data-due-time-region]')
      .click();

    cy
      .get('.picklist')
      .contains('7:00 AM')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.due_time).to.equal('07:00:00');
      });

    cy
      .get('.sidebar')
      .find('[data-due-date-region]')
      .contains(formatDate(testDateSubtract(2), 'LONG'))
      .children()
      .should('have.css', 'color', stateColors.error)
      .click();

    cy
      .get('.datepicker')
      .contains('Today')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.due_date).to.equal(testDate());
      });

    cy
      .get('.sidebar')
      .find('[data-due-time-region]')
      .find('.is-overdue');

    cy
      .get('.sidebar')
      .find('[data-due-time-region]')
      .click();

    cy
      .get('.picklist')
      .contains('1:30 PM')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.due_time).to.equal('13:30:00');
      });

    cy
      .get('.sidebar')
      .find('[data-due-time-region]')
      .find('.is-overdue')
      .should('not.exist');

    cy
      .get('.sidebar')
      .find('[data-due-time-region]')
      .click();

    cy
      .get('.picklist')
      .contains('Clear Time')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.due_time).to.be.null;
      });

    cy
      .get('.sidebar')
      .find('[data-due-date-region]')
      .contains(formatDate(testDate(), 'LONG'))
      .children()
      .should('not.have.css', 'color', stateColors.error)
      .click();

    cy
      .get('.datepicker')
      .contains('Clear')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.due_date).to.be.null;
        expect(data.attributes.due_time).to.be.null;
      });

    cy
      .get('.sidebar')
      .find('[data-duration-region]')
      .contains('5')
      .click();

    cy
      .get('.picklist')
      .contains('Clear')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.duration).to.equal(0);
      });

    cy
      .get('.sidebar')
      .find('[data-duration-region]')
      .contains('Select Duration')
      .click();

    cy
      .get('.picklist')
      .contains('3 mins')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.duration).to.equal(3);
      });

    cy
      .get('.sidebar')
      .find('[data-state-region]')
      .contains('In Progress')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('Done')
      .click();

    cy
      .get('.sidebar')
      .find('[data-form-sharing-region]')
      .should('contain', 'Share Form');

    cy
      .get('.sidebar__footer')
      .contains('Added')
      .next()
      .should('contain', formatDate(testTs(), 'AT_TIME'));

    cy
      .get('.sidebar__footer')
      .contains('Updated')
      .next()
      .should('contain', formatDate(testTs(), 'AT_TIME'));

    cy
      .get('.sidebar')
      .find('[data-attachments-region]')
      .should('be.empty');

    cy
      .get('[data-activity-region]')
      // source = 'api' activity events
      .should('contain', 'Clinician McTester (Nurse) added this action')
      .should('contain', 'Clinician McTester (Nurse) changed the owner to Another Clinician')
      .should('contain', 'Clinician McTester (Nurse) updated the details of this action')
      .should('contain', 'Clinician McTester (Nurse) changed the due date to Sep 10, 2019')
      .should('contain', 'Clinician McTester (Nurse) cleared the due date')
      .should('contain', 'Clinician McTester (Nurse) updated the duration to 10')
      .should('contain', 'Clinician McTester (Nurse) cleared duration')
      .should('contain', 'Clinician McTester (Nurse) updated the name of this action from New Action to New Action Name Updated')
      .should('contain', 'Clinician McTester (Nurse) changed the owner to Physician')
      .should('contain', 'Clinician McTester (Nurse) changed the state to Done')
      .should('contain', 'Clinician McTester (Nurse) added the form Test Form')
      .should('contain', 'Clinician McTester (Nurse) removed the form Test Form')
      .should('contain', 'Clinician McTester (Nurse) worked on the form Test Form')
      .should('contain', 'Clinician McTester (Nurse) changed the due time to 11:12 AM')
      .should('contain', 'Clinician McTester (Nurse) cleared the due time')
      .should('contain', 'Form shared with Test Patient. Waiting for response.')
      .should('contain', 'Clinician McTester (Nurse) cancelled form sharing')
      .should('contain', 'Test Patient completed the form Test Form')
      // source = 'system' activity events
      .should('contain', 'Action (Coordinator) added')
      .should('contain', 'Owner changed to Another Clinician')
      .should('contain', 'Action details updated')
      .should('contain', 'Due Date changed to Sep 10, 2019')
      .should('contain', 'Due Date cleared')
      .should('contain', 'Duration updated to 10')
      .should('contain', 'Duration cleared')
      .should('contain', 'Action name updated from New Action to New Action Name Updated')
      .should('contain', 'Owner changed to Physician')
      .should('contain', 'State changed to Done')
      .should('contain', 'Form Test Form added')
      .should('contain', 'Form Test Form removed')
      .should('contain', 'Form Test Form completed')
      .should('contain', 'Form Test Form worked on')
      .should('contain', 'Due Time changed to 11:12 AM')
      .should('contain', 'Due Time cleared')
      .should('contain', 'Form shared with Test Patient. Waiting for response.')
      .should('contain', 'Form sharing (Nurse) cancelled');
  });

  specify('action attachments', function() {
    const actionData = {
      id: '1',
      attributes: {
        name: 'Name',
        details: 'Details',
        duration: 5,
        due_date: testDateSubtract(2),
        due_time: null,
        updated_at: testTs(),
      },
      relationships: {
        owner: { data: null },
        state: { data: { id: '22222' } },
        files: { data: [{ id: '1' }, { id: '2' }] },
        patient: { data: { id: '1' } },
        program_action: { data: { id: '1' } },
      },
    };

    cy
      .routesForPatientAction()
      .routeSettings(fx => {
        fx.data.push({ id: 'upload_attachments', attributes: { value: true } });

        return fx;
      })
      .routeAction(fx => {
        fx.data = actionData;

        fx.data.relationships.owner.data = {
          id: '11111',
          type: 'clinicians',
        };

        fx.included.push({
          id: '1',
          type: 'program-actions',
          attributes: {
            allowed_uploads: ['pdf'],
          },
        });

        return fx;
      })
      .routeActionFiles(fx => {
        fx.data = [
          {
            id: '1',
            attributes: {
              path: 'patients/1/HRA.pdf',
              created_at: '2019-08-24T14:15:22Z',
            },
            meta: {
              view: 'https://www.bucket_name.s3.amazonaws.com/patients/1/view/HRA.pdf',
              download: 'https://www.bucket_name.s3.amazonaws.com/patients/1/download/HRA.pdf',
            },
          },
          {
            id: '2',
            attributes: {
              path: 'patients/1/HRA v2.pdf',
              created_at: '2019-08-25T14:15:22Z',
            },
            meta: {
              view: 'https://www.bucket_name.s3.amazonaws.com/patients/1/view/HRA%20v2.pdf',
              download: 'https://www.bucket_name.s3.amazonaws.com/patients/1/download/HRA%20v2.pdf',
            },
          },
        ];

        return fx;
      })
      .visit('/patient/1/action/1')
      .wait('@routeAction')
      .wait('@routeActionFiles');

    cy
      .get('.sidebar')
      .find('[data-attachments-files-region]')
      .children()
      .as('attachmentItems')
      .should('have.length', 2);

    cy
      .get('@attachmentItems')
      .first()
      .contains('HRA v2.pdf')
      .as('attachmentItem')
      .should('have.attr', 'href')
      .and('contain', 'https://www.bucket_name.s3.amazonaws.com/patients/1/view/HRA%20v2.pdf');

    cy
      .get('@attachmentItem')
      .should('have.attr', 'target')
      .and('contain', '_blank');

    cy
      .get('@attachmentItems')
      .first()
      .contains('Download')
      .as('attachmentDownload')
      .should('have.attr', 'href')
      .and('contain', 'https://www.bucket_name.s3.amazonaws.com/patients/1/download/HRA%20v2.pdf');

    cy
      .get('@attachmentDownload')
      .should('have.attr', 'download');

    cy
      .get('@attachmentItems')
      .first()
      .contains('Remove')
      .click();

    cy
      .get('.modal--small')
      .find('.js-close')
      .first()
      .click();

    cy
      .get('@attachmentItems')
      .first()
      .contains('HRA v2.pdf');

    cy
      .intercept('DELETE', '/api/files/*', {
        statusCode: 204,
        body: {},
      })
      .as('routeDeleteFile');

    cy
      .get('@attachmentItems')
      .first()
      .contains('Remove')
      .click();

    cy
      .get('.modal--small')
      .find('.js-submit')
      .click()
      .wait('@routeDeleteFile')
      .itsUrl()
      .its('pathname')
      .should('contain', '/api/files/2');

    const putFileURL = '/api/actions/**/relationships/files?urls=upload';

    let firstCall = true;
    let fileId;

    cy
      .intercept('PUT', putFileURL, req => {
        if (firstCall) {
          expect(req.body.data.attributes.path).to.include('test.pdf');
          firstCall = false;
          req.reply({
            statusCode: 400,
            body: {
              errors: [
                {
                  id: '1',
                  status: '400',
                  title: 'Bad Request',
                  detail: 'Another file exists for that path',
                  source: {
                    pointer: '/data/attributes/path',
                  },
                },
              ],
            },
          });
          return;
        }
        expect(req.body.data.attributes.path).to.include('test-copy.pdf');
        fileId = req.body.data.id;
        req.reply({
          statusCode: 201,
          body: {
            data: {
              id: fileId,
              attributes: {
                path: req.body.data.attributes.path,
                created_at: testTs(),
              },
              meta: {
                upload: '/upload-test',
              },
            },
          },
        });
      }).as('routePutFile');

    cy
      .intercept('PUT', '/upload-test', req => {
        req.reply({
          statusCode: 200,
          throttleKbps: 10,
        });
      }).as('routeUploadFile');

    cy
      .intercept('GET', '/api/files/*', req => {
        req.reply({
          statusCode: 200,
          body: {
            data: {
              id: fileId,
              attributes: {
                path: '/dir/test-copy.pdf',
                created_at: testTs(),
              },
              meta: {
                download: '/download-test',
                view: '/view-test',
              },
            },
          },
        });
      }).as('routeGetFile');

    cy
      .get('#upload-attachment')
      .selectFile({
        contents: Cypress.Buffer.from('test'),
        fileName: 'test.pdf',
      }, { force: true });

    cy
      .wait('@routeGetFile')
      .get('.sidebar')
      .find('[data-attachments-files-region]')
      .children()
      .first()
      .contains('test-copy.pdf');

    cy
      .intercept('PUT', '/upload-test', req => {
        req.reply({
          statusCode: 400,
        });
      }).as('routeUploadFail');

    cy
      .get('#upload-attachment')
      .selectFile({
        contents: Cypress.Buffer.from('test-fail'),
        fileName: 'test-copy.pdf',
      }, { force: true });

    cy
      .wait('@routeUploadFail')
      .get('.alert-box')
      .should('contain', 'File failed to upload');

    cy
      .wait('@routeDeleteFile')
      .itsUrl()
      .its('pathname')
      .then(pathname => {
        expect(pathname).to.contain(`/api/files/${ fileId }`);
      });
  });

  specify('action attachments - uploads not allowed on program action', function() {
    cy
      .routesForPatientAction()
      .routeSettings(fx => {
        fx.data.push({ id: 'upload_attachments', attributes: { value: true } });

        return fx;
      })
      .routeAction(fx => {
        fx.data = {
          id: '1',
          attributes: {
            name: 'Test Action',
          },
          relationships: {
            owner: { data: { id: '11111', type: 'clinicians' } },
            files: { data: [{ id: '1' }] },
            program_action: { data: { id: '1' } },
          },
        };

        fx.included.push({
          id: '1',
          type: 'program-actions',
          attributes: {
            allowed_uploads: [],
          },
        });

        return fx;
      })
      .routeActionFiles(fx => {
        fx.data = [
          {
            id: '1',
            attributes: {
              path: 'patients/1/HRA.pdf',
              created_at: '2019-08-24T14:15:22Z',
            },
            meta: {
              view: 'https://www.bucket_name.s3.amazonaws.com/patients/1/view/HRA.pdf',
              download: 'https://www.bucket_name.s3.amazonaws.com/patients/1/download/HRA.pdf',
            },
          },
        ];

        return fx;
      })
      .visit('/patient/1/action/1')
      .wait('@routeAction')
      .wait('@routeActionFiles');

    cy
      .get('.sidebar')
      .find('[data-attachments-files-region]')
      .children()
      .should('have.length', 1);

    cy
      .get('.sidebar')
      .find('[data-attachments-region]')
      .find('.js-add')
      .should('not.exist');
  });

  specify('action attachments - uploads not allowed for org', function() {
    cy
      .routesForPatientAction()
      .routeSettings(fx => {
        fx.data.push({ id: 'upload_attachments', attributes: { value: false } });

        return fx;
      })
      .routeAction(fx => {
        fx.data = {
          id: '1',
          attributes: {
            name: 'Test Action',
          },
          relationships: {
            owner: { data: { id: '11111', type: 'clinicians' } },
            files: { data: [{ id: '1' }] },
            program_action: { data: { id: '1' } },
          },
        };

        fx.included.push({
          id: '1',
          type: 'program-actions',
          attributes: {
            allowed_uploads: ['pdf'],
          },
        });

        return fx;
      })
      .routeActionFiles(fx => {
        fx.data = [
          {
            id: '1',
            attributes: {
              path: 'patients/1/HRA.pdf',
              created_at: '2019-08-24T14:15:22Z',
            },
            meta: {
              view: 'https://www.bucket_name.s3.amazonaws.com/patients/1/view/HRA.pdf',
              download: 'https://www.bucket_name.s3.amazonaws.com/patients/1/download/HRA.pdf',
            },
          },
        ];

        return fx;
      })

      .visit('/patient/1/action/1')
      .wait('@routeAction')
      .wait('@routeActionFiles');

    cy
      .get('.sidebar')
      .find('[data-attachments-files-region]')
      .children()
      .should('have.length', 1);

    cy
      .get('.sidebar')
      .find('[data-attachments-region]')
      .find('.js-add')
      .should('not.exist');
  });

  specify('action comments', function() {
    cy
      .routesForPatientAction()
      .routeActionActivity(fx => {
        fx.data[0].attributes.date = testTsSubtract(8);
        fx.data = [
          fx.data[0],
          getActivity({
            date: testTs(),
          }),
        ];

        return fx;
      })
      .routeActionComments(fx => {
        fx.data = _.sample(fx.data, 3);

        fx.data[0].relationships.clinician.data = { id: '11111' };
        fx.data[0].attributes.edited_at = null;
        fx.data[0].attributes.created_at = testTsSubtract(2);
        fx.data[0].attributes.message = 'Least Recent Message from Clinician McTester';

        fx.data[1].relationships.clinician.data = { id: '11111' };
        fx.data[1].attributes.edited_at = testTs();
        fx.data[1].attributes.created_at = testTsSubtract(1);
        fx.data[1].attributes.message = 'Most Recent Message from Clinician McTester';

        fx.data[2].relationships.clinician.data = { id: '22222' };
        fx.data[2].attributes.created_at = testTsSubtract(4);
        fx.data[2].attributes.message = 'Message from Someone Else';
        fx.data[2].attributes.edited_at = null;


        return fx;
      })

      .visit('/patient/1/action/12345')
      .wait('@routeActionActivity')
      .wait('@routeActionComments');

    cy
      .get('[data-activity-region]')
      .find('.comment__item')
      .eq(2)
      .should('contain', 'CM')
      .should('contain', 'Clinician McTester')
      .should('contain', 'Edit')
      .should('contain', 'Most Recent Message from Clinician McTester')
      .should('contain', '(Edited)');

    cy
      .get('[data-activity-region]')
      .find('.comment__item')
      .eq(2)
      .find('.js-edit')
      .as('editIcon')
      .trigger('pointerover');

    cy
      .get('.tooltip')
      .should('contain', 'Last edited on');

    cy
      .get('@editIcon')
      .trigger('mouseout');

    cy
      .get('[data-activity-region]')
      .find('.comment__item')
      .eq(1)
      .should('contain', 'CM')
      .should('contain', 'Clinician McTester')
      .should('contain', 'Edit')
      .should('contain', 'Least Recent Message from Clinician McTester')
      .should('not.contain', '(Edited)');

    cy
      .get('[data-activity-region]')
      .find('.comment__item')
      .eq(1)
      .as('activityComment')
      .find('.js-edit')
      .trigger('pointerover');

    cy
      .get('.tooltip')
      .should('not.exist');

    cy
      .get('[data-activity-region]')
      .find('.comment__item')
      .eq(0)
      .should('not.contain', 'CM')
      .should('not.contain', 'Clinician McTester')
      .should('not.contain', 'Edit')
      .should('contain', 'Message from Someone Else')
      .should('not.contain', '(Edited)');

    cy
      .get('@activityComment')
      .find('.js-edit')
      .click();

    cy
      .get('[data-activity-region]')
      .find('.js-post')
      .should('contain', 'Save')
      .should('be.disabled');

    cy
      .get('[data-activity-region]')
      .find('.js-cancel')
      .click();

    cy
      .get('@activityComment')
      .should('contain', 'Least Recent Message from Clinician McTester')
      .should('not.contain', '(Edited)');

    cy
      .get('@activityComment')
      .find('.js-edit')
      .click();

    cy
      .intercept('PATCH', '/api/comments/*', {
        statusCode: 204,
        body: {},
      })
      .as('routePatchComment');

    cy
      .get('[data-activity-region]')
      .find('.js-input')
      .clear()
      .type('An edited comment');

    cy
      .get('[data-activity-region]')
      .find('.js-post')
      .click();

    cy
      .wait('@routePatchComment')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.message).to.equal('An edited comment');
      });

    cy
      .get('@activityComment')
      .should('contain', 'An edited comment')
      .find('.comment__edited');

    cy
      .intercept('DELETE', '/api/comments/*', {
        statusCode: 204,
        body: {},
      })
      .as('routeDeleteComment');

    cy
      .get('@activityComment')
      .find('.js-edit')
      .click();

    cy
      .get('[data-activity-region]')
      .find('.js-delete')
      .click();

    cy
      .get('.modal--small')
      .should('contain', 'Are you sure you want to delete this comment?')
      .find('.js-submit')
      .click()
      .wait('@routeDeleteComment');

    cy
      .get('[data-activity-region]')
      .find('.comment__item')
      .should('have.length', 2);

    cy
      .get('.sidebar')
      .find('[data-comment-region]')
      .as('commentRegion')
      .find('[data-post-region] .js-post')
      .should('be.disabled');

    cy
      .get('@commentRegion')
      .find('.js-input')
      .type('Test comment');

    cy
      .get('@commentRegion')
      .find('.js-cancel')
      .click();

    cy
      .get('@commentRegion')
      .find('.js-input')
      .should('have.value', '');

    cy
      .get('@commentRegion')
      .find('.js-post')
      .should('be.disabled');

    cy
      .get('@commentRegion')
      .find('.js-input')
      .type('Test comment')
      .clear();

    cy
      .get('@commentRegion')
      .find('.js-input')
      .type('Test comment')
      .type('{enter}')
      .type('more comment');

    cy
      .intercept('POST', '/api/actions/*/relationships/comments', {
        statusCode: 204,
        body: {},
      })
      .as('routePostComment');

    cy
      .get('@commentRegion')
      .find('.js-post')
      .should('contain', 'Post')
      .click();

    cy
      .wait('@routePostComment')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.message).to.equal('Test comment\nmore comment');
      });

    cy
      .get('[data-activity-region]')
      .find('.comment__item .comment__message')
      .last()
      .should('contain', 'Test comment')
      .should('contain', 'more comment');
  });

  specify('display action from program action', function() {
    cy
      .routesForPatientAction()
      .routeSettings(fx => {
        fx.data.push({ id: 'upload_attachments', attributes: { value: true } });

        return fx;
      })
      .routeAction(fx => {
        fx.data.id = '12345';
        fx.data.attributes.name = 'Program Action Name';
        fx.data.relationships['program-action'] = { data: { id: '1' } };
        fx.data.relationships.form = { data: { id: '11111' } };

        fx.included.push({
          id: '1',
          type: 'program-actions',
          attributes: {
            allowed_uploads: ['pdf'],
          },
        });

        return fx;
      })
      .routeActionActivity(fx => {
        fx.data[0].relationships.editor.data = null;
        fx.data[0].attributes.date = testTs();

        fx.data = [
          fx.data[0],
          getActivity(),
          getActivity({
            date: testTs(),
            event_type: 'ActionCopiedFromProgramAction',
            source: 'api',
          }, {
            'program': getRelationship('1', 'programs'),
            'program-action': getRelationship('1', 'program-actions'),
            'editor': getRelationship('11111', 'clinicians'),
          }),
        ];

        fx.included.push({
          id: '1',
          type: 'programs',
          attributes: {
            name: 'Test Program',
          },
        });
        return fx;
      })
      .routeFormByAction()
      .routeFormDefinition()
      .routeLatestFormResponse()
      .visit('/patient/1/action/12345')
      .wait('@routeAction');

    cy
      .get('[data-name-region] .action-sidebar__name')
      .should('contain', 'Program Action Name');

    cy
      .get('.sidebar')
      .find('[data-attachments-region]')
      .contains('No Attachments');

    cy
      .get('.sidebar')
      .find('[data-attachments-region]')
      .find('.js-add')
      .should('exist');

    cy
      .get('[data-activity-region]')
      .find('[data-activities-region]')
      .should('contain', 'Clinician McTester (Nurse) added this action from the Test Program program')
      .children()
      .its('length')
      .should('equal', 7);

    cy
      .routePatientByAction();

    cy
      .get('[data-form-region] button')
      .should('contain', 'Test Form')
      .click();

    cy
      .url()
      .should('contain', 'patient-action/12345/form/11111');

    cy
      .go('back');
  });

  specify('deleted action', function() {
    cy
      .routesForPatientDashboard()
      .intercept('GET', '/api/actions/1*', {
        statusCode: 404,
        body: {
          errors: [{
            id: '1',
            status: '404',
            title: 'Not Found',
            detail: 'Cannot find action',
            source: { parameter: 'actionId' },
          }],
        },
      })
      .as('routeAction')
      .visit('/patient/1/action/1')
      .wait('@routeAction');

    cy
      .get('.alert-box__body')
      .should('contain', 'The Action you requested does not exist.');

    cy
      .get('.sidebar')
      .should('not.exist');

    cy
      .get('.patient__list');
  });

  specify('outreach', function() {
    cy
      .routesForPatientAction()
      .routeAction(fx => {
        fx.data.id = '12345';
        fx.data.attributes.name = 'Program Action Name';
        fx.data.attributes.outreach = 'patient';
        fx.data.attributes.sharing = 'pending';
        fx.data.relationships['program-action'] = { data: { id: '1' } };
        fx.data.relationships.form = { data: { id: '11111' } };
        fx.data.relationships.state = { data: { id: '11111' } };
        fx.included.push({
          id: '1',
          type: 'programs',
          attributes: {
            name: 'Test Program',
          },
        });
        return fx;
      })
      .visit('/patient/1/action/12345')
      .wait('@routeAction');

    cy
      .intercept('PATCH', '/api/actions/12345', {
        statusCode: 204,
        body: {},
      })
      .as('routePatchAction');

    cy
      .get('.sidebar')
      .find('[data-form-region]')
      .contains('Test Form');

    cy
      .get('.sidebar')
      .contains('Cancel Share')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.sharing).to.equal('canceled');
      });

    cy
      .get('.sidebar')
      .contains('Undo Cancel Share')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.sharing).to.equal('pending');
      });
  });

  specify('outreach error', function() {
    cy
      .routesForPatientAction()
      .routeAction(fx => {
        fx.data.id = '12345';
        fx.data.attributes.name = 'Program Action Name';
        fx.data.attributes.outreach = 'patient';
        fx.data.attributes.sharing = 'error_no_phone';
        fx.data.relationships['program-action'] = { data: { id: '1' } };
        fx.data.relationships.form = { data: { id: '11111' } };
        fx.data.relationships.state = { data: { id: '11111' } };
        fx.included.push({
          id: '1',
          type: 'programs',
          attributes: {
            name: 'Test Program',
          },
        });
        return fx;
      })
      .visit('/patient/1/action/12345')
      .wait('@routeAction');

    cy
      .intercept('PATCH', '/api/actions/12345', {
        statusCode: 204,
        body: {},
      })
      .as('routePatchAction');

    cy
      .get('.sidebar')
      .contains('Share Form Now')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.sharing).to.equal('pending');
      });
  });

  specify('outreach form', function() {
    cy
      .routesForPatientAction()
      .routeAction(fx => {
        fx.data.id = '12345';
        fx.data.attributes.name = 'Program Action Name';
        fx.data.attributes.outreach = 'patient';
        fx.data.attributes.sharing = 'responded';
        fx.data.relationships['program-action'] = { data: { id: '1' } };
        fx.data.relationships.form = { data: { id: '11111' } };
        fx.data.relationships.state = { data: { id: '55555' } };
        fx.included.push({
          id: '1',
          type: 'programs',
          attributes: {
            name: 'Test Program',
          },
        });
        return fx;
      })
      .routeFormByAction()
      .routeFormDefinition()
      .routeLatestFormResponse()
      .visit('/patient/1/action/12345')
      .wait('@routeAction');

    cy
      .routePatientByAction();

    cy
      .get('.sidebar')
      .contains('View Response')
      .click();

    cy
      .url()
      .should('contain', 'patient-action/12345/form/11111');

    cy
      .go('back');
  });

  specify('action with work:owned:manage permission', function() {
    cy
      .routeCurrentClinician(fx => {
        fx.data.relationships.role = { data: { id: '66666' } };
        return fx;
      })
      // NOTE: Tests upload attachments with canEdit permissions
      .routeSettings(fx => {
        fx.data.push({ id: 'upload_attachments', attributes: { value: true } });

        return fx;
      })
      .routesForPatientAction()
      .routeAction(fx => {
        fx.data = {
          id: '1',
          attributes: {
            name: 'Test Action',
            outreach: 'disabled',
            sharing: 'disabled',
          },
          relationships: {
            owner: { data: { id: '11111', type: 'clinicians' } },
            state: { data: { id: '22222' } },
            form: { data: { id: '11111' } },
            files: { data: [{ id: '1' }] },
            program_action: { data: { id: '1' } },
          },
        };

        fx.included.push({
          id: '1',
          type: 'program-actions',
          attributes: {
            allowed_uploads: ['pdf'],
          },
        });

        return fx;
      })
      .routeActionFiles(fx => {
        fx.data = [
          {
            id: '1',
            attributes: {
              path: 'patients/1/HRA.pdf',
              created_at: '2019-08-24T14:15:22Z',
            },
            meta: {
              view: 'https://www.bucket_name.s3.amazonaws.com/patients/1/view/HRA.pdf',
              download: 'https://www.bucket_name.s3.amazonaws.com/patients/1/download/HRA.pdf',
            },
          },
        ];

        return fx;
      })
      .visit('/patient/1/action/1')
      .wait('@routeAction')
      .wait('@routeActionFiles');

    cy
      .intercept('PATCH', '/api/actions/1', {
        statusCode: 204,
        body: {},
      })
      .as('routePatchAction');

    cy
      .get('[data-menu-region]')
      .find('.js-menu')
      .should('exist');

    cy
      .get('[data-action-region]')
      .find('.js-input');

    cy
      .get('[data-action-region]')
      .find('button')
      .should('have.length', 5);

    cy
      .get('[data-action-region]')
      .contains('Clinician McTester')
      .click();

    cy
      .get('.picklist')
      .contains('Nurse')
      .click()
      .wait('@routePatchAction');

    cy
      .get('[data-menu-region]')
      .find('.js-menu')
      .should('not.exist');

    cy
      .get('[data-action-region]')
      .find('button')
      .should('not.exist');

    cy
      .get('[data-action-region]')
      .find('.js-input')
      .should('not.exist');

    cy
      .get('[data-action-region]')
      .should('contain', 'No details')
      .and('contain', 'No Duration');

    cy
      .get('.sidebar')
      .find('[data-attachments-files-region]')
      .children()
      .should('have.length', 1)
      .find('.js-remove')
      .should('not.exist');

    cy
      .get('.sidebar')
      .find('[data-attachments-region]')
      .find('.js-add')
      .should('not.exist');

    cy
      .get('.sidebar')
      .find('[data-action-region]')
      .should('contain', 'Permissions')
      .and('contain', 'You are not able to change settings on this action.');
  });

  specify('action with work:team:manage permission', function() {
    cy
      .routesForPatientAction()
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
      .routePatient(fx => {
        fx.data.id = '1';

        return fx;
      })
      .routeAction(fx => {
        fx.data = {
          id: '1',
          attributes: {
            name: 'Owned by another team',
          },
          relationships: {
            owner: { data: { id: '22222', type: 'teams' } },
            state: { data: { id: '33333' } },
          },
        };

        return fx;
      })
      .routePatientActions(fx => {
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
      .routePatientFlows(fx => {
        fx.data = [];

        return fx;
      })
      .routeActionFiles()
      .visit('/patient/1/action/1')
      .wait('@routeAction')
      .wait('@routePatient')
      .wait('@routePatientActions')
      .wait('@routePatientFlows');

    cy
      .get('[data-action-region]')
      .should('contain', 'Permissions')
      .and('contain', 'You are not able to change settings on this action.');

    cy
      .routeAction(fx => {
        fx.data = {
          id: '2',
          attributes: {
            name: 'Owned by non team member',
          },
          relationships: {
            owner: { data: { id: '22222', type: 'clinicians' } },
            state: { data: { id: '33333' } },
          },
        };

        return fx;
      });

    cy
      .get('.patient__list')
      .find('.table-list__item')
      .last()
      .find('.patient__action-name')
      .click()
      .wait('@routeAction');

    cy
      .get('[data-action-region]')
      .should('contain', 'Permissions')
      .and('contain', 'You are not able to change settings on this action.');
  });

  specify('action with work:authored:delete permission', function() {
    cy
      .routesForPatientAction()
      .routeCurrentClinician(fx => {
        fx.data.relationships.role = { data: { id: '77777' } };
        fx.data.relationships.team = { data: { id: '11111', type: 'teams' } };

        return fx;
      })
      .routePatient(fx => {
        fx.data.id = '1';

        return fx;
      })
      .routeAction(fx => {
        fx.data = {
          id: '1',
          attributes: {
            name: 'Authored by Current User',
          },
          relationships: {
            author: { data: { id: '11111', type: 'clinicians' } },
            owner: { data: { id: '11111', type: 'teams' } },
            state: { data: { id: '33333' } },
          },
        };

        return fx;
      })
      .routePatientActions(fx => {
        fx.data = _.sample(fx.data, 2);

        fx.data[0].id = '1';
        fx.data[0].attributes.name = 'Authored by Current User';
        fx.data[0].attributes.updated_at = testTsSubtract(1);
        fx.data[0].relationships.author = { data: { id: '11111', type: 'clinicians' } };
        fx.data[0].relationships.state = { data: { id: '33333' } };
        fx.data[0].relationships.owner = { data: { id: '11111', type: 'teams' } };

        fx.data[1].id = '2';
        fx.data[1].attributes.name = 'Not authored by Current User';
        fx.data[1].attributes.updated_at = testTsSubtract(2);
        fx.data[0].relationships.author = { data: { id: '22222', type: 'clinicians' } };
        fx.data[1].relationships.state = { data: { id: '33333' } };
        fx.data[1].relationships.owner = { data: { id: '11111', type: 'teams' } };

        return fx;
      })
      .routePatientFlows(fx => {
        fx.data = [];

        return fx;
      })
      .routeActionFiles()
      .visit('/patient/1/action/1')
      .wait('@routeAction')
      .wait('@routePatient')
      .wait('@routePatientActions')
      .wait('@routePatientFlows');

    cy
      .get('.app-frame__sidebar')
      .as('flowSidebar')
      .find('[data-menu-region]')
      .should('not.be.empty');

    cy
      .routeAction(fx => {
        fx.data = {
          id: '2',
          attributes: {
            name: 'Not authored by Current User',
          },
          relationships: {
            author: { data: { id: '22222', type: 'clinicians' } },
            owner: { data: { id: '11111', type: 'teams' } },
            state: { data: { id: '33333' } },
          },
        };

        return fx;
      });

    cy
      .get('.patient__list')
      .find('.table-list__item')
      .contains('Not authored by Current User')
      .click()
      .wait('@routeAction');

    cy
      .get('.app-frame__sidebar')
      .as('flowSidebar')
      .find('[data-menu-region]')
      .should('be.empty');
  });

  specify('flow action with work:owned:manage permission', function() {
    cy
      .routeCurrentClinician(fx => {
        fx.data.relationships.role = { data: { id: '66666' } };
        return fx;
      })
      .routesForPatientAction()
      .routePatientByFlow()
      .routeFlow(fx => {
        fx.data.id = '1';

        fx.data.relationships.state.data = { id: '22222' };
        fx.data.relationships.owner.data = { id: '11111', type: 'clinicians' };

        return fx;
      })
      .routeFlowActions()
      .routeAction(fx => {
        fx.data = {
          id: '1',
          attributes: {
            name: 'Test Action',
            details: 'Test Details',
            outreach: 'disabled',
            sharing: 'disabled',
            duration: 5,
            due_date: testDateSubtract(2),
            due_time: '07:15:00',
          },
          relationships: {
            owner: { data: { id: '22222', type: 'clinicians' } },
            state: { data: { id: '22222' } },
            form: { data: { id: '11111' } },
            flow: { data: { id: '1' } },
          },
        };

        return fx;
      })
      .visit('/flow/1/action/1')
      .wait('@routeFlow');

    cy
      .intercept('PATCH', '/api/flows/1', {
        statusCode: 204,
        body: {},
      })
      .as('routePatchFlow');

    cy
      .intercept('PATCH', '/api/actions/1', {
        statusCode: 204,
        body: {},
      })
      .as('routePatchAction');

    cy
      .get('[data-header-region]')
      .find('[data-state-region]')
      .click();

    cy
      .get('.picklist')
      .contains('Complete')
      .click();

    cy
      .get('.modal--small')
      .find('.js-submit')
      .click();

    cy
      .get('[data-action-region]')
      .should('contain', 'Test Details')
      .and('contain', formatDate(testDateSubtract(2), 'SHORT'))
      .and('contain', '7:15 AM')
      .and('contain', '5 mins');

    cy
      .get('.sidebar')
      .find('[data-action-region] .sidebar__label')
      .should('contain', 'Permissions');
  });

  specify('flow action with work:team:manage permission', function() {
    cy
      .routesForPatientAction()
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
        fx.data.relationships.state.data = { id: '33333' };

        return fx;
      })
      .routeAction(fx => {
        fx.data = {
          id: '1',
          attributes: {
            name: 'Owned by another team',
          },
          relationships: {
            owner: { data: { id: '22222', type: 'teams' } },
            state: { data: { id: '33333' } },
            flow: { data: { id: '1' } },
          },
        };

        return fx;
      })
      .routeFlowActions(fx => {
        fx.data = _.sample(fx.data, 2);

        fx.data[0].id = '1';
        fx.data[0].attributes.name = 'Owned by another team';
        fx.data[0].relationships.state = { data: { id: '33333' } };
        fx.data[0].relationships.owner = { data: { id: '22222', type: 'teams' } };
        fx.data[0].attributes.sequence = 0;

        fx.data[1].id = '2';
        fx.data[1].attributes.name = 'Owned by non team member';
        fx.data[1].relationships.state = { data: { id: '33333' } };
        fx.data[1].relationships.owner = { data: { id: '22222', type: 'clinicians' } };
        fx.data[1].attributes.sequence = 1;

        return fx;
      })
      .routePatientByFlow()
      .visit('/flow/1/action/1')
      .wait('@routeFlow')
      .wait('@routeAction');

    cy
      .get('[data-action-region]')
      .should('contain', 'Permissions')
      .and('contain', 'You are not able to change settings on this action.');

    cy
      .routeAction(fx => {
        fx.data = {
          id: '4',
          attributes: {
            name: 'Owned by non team member',
          },
          relationships: {
            owner: { data: { id: '22222', type: 'clinicians' } },
            state: { data: { id: '33333' } },
            flow: { data: { id: '1' } },
          },
        };

        return fx;
      });

    cy
      .get('.patient-flow__list')
      .find('.table-list__item')
      .last()
      .find('.patient__action-name')
      .click()
      .wait('@routeAction');

    cy
      .get('[data-action-region]')
      .should('contain', 'Permissions')
      .and('contain', 'You are not able to change settings on this action.');
  });
});
