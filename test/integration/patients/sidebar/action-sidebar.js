import _ from 'underscore';
import dayjs from 'dayjs';

import formatDate from 'helpers/format-date';
import { testTs, testTsSubtract } from 'helpers/test-timestamp';
import { testDate, testDateSubtract } from 'helpers/test-date';

const stateColors = Cypress.env('stateColors');

context('action sidebar', function() {
  specify('display new action sidebar', function() {
    cy
      .server()
      .routePatientActions()
      .routePatientFlows()
      .routeActionActivity()
      .routeActionComments()
      .routePatient(fx => {
        fx.data.id = '1';
        return fx;
      })
      .routePrograms()
      .routeAllProgramActions()
      .routeAllProgramFlows()
      .routeProgramByAction()
      .visit('/patient/1/action')
      .wait('@routePatientActions')
      .wait('@routePatientFlows')
      .wait('@routePatient')
      .wait('@routePrograms')
      .wait('@routeAllProgramActions')
      .wait('@routeAllProgramFlows');

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
      .find('[data-due-day-region]')
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
      .should('not.exist');

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
      .route({
        status: 201,
        method: 'POST',
        url: '/api/patients/1/relationships/actions*',
        response: {
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
      .find('.js-menu')
      .click();

    cy
      .route({
        status: 403,
        method: 'DELETE',
        url: '/api/actions/1*',
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
      .find('.js-menu')
      .click();

    cy
      .route({
        status: 204,
        method: 'DELETE',
        url: '/api/actions/1*',
        response: {},
      })
      .as('routeDeleteAction');

    cy
      .get('.picklist')
      .contains('Delete Action')
      .click();

    cy
      .wait('@routeDeleteAction')
      .its('url')
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
    const testTime = dayjs().hour(12).utc().valueOf();
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
      },
    };

    cy.clock(testTime, ['Date']);

    cy
      .server()
      .routeRoles(fx => {
        fx.data.push({
          id: 'not-included',
          type: 'roles',
          attributes: {
            name: 'Not Included',
            short: 'NOT',
          },
        });
        return fx;
      })
      .routeGroupsBootstrap(fx => {
        fx.data[2].id = '1';
        fx.data[2].attributes.name = 'Group One';
        fx.data[2].relationships.clinicians.data[1] = { id: '22222', type: 'clinicians' };

        return fx;
      }, null, fx => {
        fx.data.push({
          id: '22222',
          type: 'clinicians',
          attributes: {
            name: 'Another Clinician',
          },
          relationships: {
            role: { id: '11111' },
          },
        });
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

        return fx;
      }, '1')
      .routePatientFlows(_.identity, '1')
      .routeActionActivity(fx => {
        fx.data = [...this.fxEvents, {}];
        fx.data[0].relationships.editor.data = null;
        fx.data[0].attributes.date = testTs();


        return fx;
      })
      .routeActionComments()
      .routePrograms()
      .routeAllProgramActions()
      .routeAllProgramFlows()
      .routePatient(fx => {
        fx.data.id = '1';
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
      .visit('/patient/1/action/1')
      .wait('@routePatientActions')
      .wait('@routePatientFlows')
      .wait('@routeAction')
      .wait('@routeActionActivity')
      .wait('@routeActionComments')
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
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/actions/1',
        response: {},
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
      .should('contain', 'Group One');

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
        expect(data.relationships.owner.data.type).to.equal('roles');
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
      .find('[data-due-day-region]')
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
      .find('[data-due-day-region]')
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
      .contains('Done')
      .click();

    cy
      .get('.sidebar')
      .find('[data-form-region]')
      .should('be.empty');

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
      .get('[data-activity-region]')
      .should('contain', 'RoundingWell (System) added this Action')
      .should('contain', 'Clinician McTester (Nurse) changed the Owner to Another Clinician')
      .should('contain', 'Clinician McTester (Nurse) changed the details of this Action')
      .should('contain', 'Clinician McTester (Nurse) changed the Due Date to ')
      .should('contain', 'Clinician McTester (Nurse) cleared the Due Date')
      .should('contain', 'Clinician McTester (Nurse) changed Duration to 10')
      .should('contain', 'Clinician McTester (Nurse) cleared Duration')
      .should('contain', 'Clinician McTester (Nurse) changed the name of this Action from New Action to New Action Name Updated')
      .should('contain', 'Clinician McTester (Nurse) changed the Owner to Physician')
      .should('contain', 'Clinician McTester (Nurse) changed State to Done')
      .should('contain', 'Clinician McTester (Nurse) added the form Test Form')
      .should('contain', 'Clinician McTester (Nurse) removed the form Test Form')
      .should('contain', 'Clinician McTester (Nurse) worked on the form Test Form')
      .should('contain', 'Clinician McTester (Nurse) changed the Due Time to ')
      .should('contain', 'Clinician McTester (Nurse) cleared the Due Time');

    cy.clock().invoke('restore');
  });

  specify('action comments', function() {
    cy
      .server()
      .routePatient()
      .routePatientActions()
      .routePatientFlows()
      .routeAction()
      .routeActionActivity(fx => {
        fx.data = [];
        fx.data[0] = this.fxEvents[0];
        fx.data[1] = this.fxEvents[1];

        fx.data[0].attributes.date = testTsSubtract(8);
        fx.data[1].attributes.date = testTs();

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
      .routePrograms()
      .routeAllProgramActions()
      .routeAllProgramFlows()
      .visit('/patient/1/action/12345')
      .wait('@routePatient')
      .wait('@routePatientActions')
      .wait('@routeAction')
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
      .trigger('mouseover');

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
      .trigger('mouseover');

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
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/comments/*',
        response: {},
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
      .route({
        status: 204,
        method: 'DELETE',
        url: '/api/comments/*',
        response: {},
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
      .route({
        status: 204,
        method: 'POST',
        url: '/api/actions/*/relationships/comments',
        response: {},
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
      .server()
      .routePatient()
      .routePatientActions()
      .routePatientFlows()
      .routeAction(fx => {
        fx.data.id = '12345';
        fx.data.relationships['program-action'] = { data: { id: '1' } };
        fx.data.relationships.form = { data: { id: '11111' } };
        return fx;
      })
      .routeActionActivity(fx => {
        fx.data = [];
        fx.data[0] = this.fxEvents[0];
        fx.data[1] = this.fxEvents[1];
        fx.data[0].relationships.editor.data = null;
        fx.data[0].attributes.date = testTs();

        fx.data.push({
          id: '12345',
          type: 'events',
          attributes: {
            date: testTs(),
            type: 'ActionCopiedFromProgramAction',
          },
          relationships: {
            'program': { data: { id: '1' } },
            'program-action': { data: { id: '1' } },
            'editor': { data: { id: '11111' } },
          },
        });

        return fx;
      })
      .routeActionComments()
      .routeProgramByAction(fx => {
        fx.data.id = '1';
        fx.data.attributes.name = 'Test Program';

        return fx;
      })
      .routePrograms()
      .routeAllProgramActions()
      .routeAllProgramFlows()
      .visit('/patient/1/action/12345')
      .wait('@routePatient')
      .wait('@routePatientActions')
      .wait('@routeAction')
      .wait('@routeActionActivity')
      .wait('@routeActionComments')
      .wait('@routeProgramByAction');

    cy
      .get('[data-activity-region]')
      .should('contain', 'Clinician McTester (Nurse) added this Action from the Test Program program')
      .children()
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
      .server()
      .routePatient()
      .routePatientActions()
      .routePatientFlows()
      .route({
        url: '/api/actions/1',
        status: 404,
        response: {
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
      .routePrograms()
      .routeAllProgramActions()
      .routeAllProgramFlows()
      .visit('/patient/1/action/1')
      .wait('@routePatient')
      .wait('@routePatientActions')
      .wait('@routePatientFlows')
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
});
