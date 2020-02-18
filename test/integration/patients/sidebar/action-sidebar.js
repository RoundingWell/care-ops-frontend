import moment from 'moment';
import _ from 'underscore';

import formatDate from 'helpers/format-date';

const stateColors = Cypress.env('stateColors');
const now = moment.utc();
const local = moment();

context('action sidebar', function() {
  specify('display new action sidebar', function() {
    cy
      .server()
      .routePatientActions()
      .routePatientFlows()
      .routeActionActivity()
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
      .get('.action-sidebar')
      .find('[data-name-region] .js-input')
      .should('be.focused')
      .should('have.attr', 'placeholder', 'New Action');

    cy
      .get('.action-sidebar')
      .find('[data-save-region]')
      .contains('Save')
      .should('be.disabled');

    cy
      .get('.action-sidebar')
      .find('[data-state-region]')
      .contains('To Do')
      .should('be.disabled');

    cy
      .get('.action-sidebar')
      .find('[data-owner-region]')
      .contains('Clinician McTester')
      .should('be.disabled');

    cy
      .get('.action-sidebar')
      .find('[data-due-day-region]')
      .contains('Select Date')
      .should('be.disabled');

    cy
      .get('.action-sidebar')
      .find('[data-due-time-region]')
      .contains('Time')
      .should('be.disabled');

    cy
      .get('.action-sidebar')
      .find('[data-duration-region]')
      .contains('Select Duration')
      .should('be.disabled');

    cy
      .get('[data-activity-region]')
      .should('not.exist');

    cy
      .get('.action-sidebar')
      .should('not.contain', 'Attachment');

    cy
      .get('.action-sidebar')
      .find('[data-name-region] .js-input')
      .type('Test Name');

    cy
      .get('.action-sidebar')
      .find('[data-save-region]')
      .contains('Cancel')
      .click();

    cy
      .get('.action-sidebar')
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
      .get('.action-sidebar')
      .find('[data-name-region] .js-input')
      .should('be.empty')
      .type('   ');

    cy
      .get('.action-sidebar')
      .find('[data-save-region]')
      .contains('Save')
      .should('be.disabled');

    cy
      .get('.action-sidebar')
      .find('[data-name-region] .js-input')
      .type('{backspace}{backspace}{backspace}');

    cy
      .get('.action-sidebar')
      .find('[data-name-region] .js-input')
      .should('be.empty')
      .type('a{backspace}')
      .type('Test{enter} Name');

    cy
      .get('.action-sidebar')
      .find('[data-details-region] .js-input')
      .type('a{backspace}')
      .type('Test{enter} Details');

    cy
      .route({
        status: 201,
        method: 'POST',
        url: '/api/patients/1/relationships/actions*',
        response: {
          data: {
            id: '1',
            attributes: { updated_at: now.format() },
          },
        },
      })
      .as('routePostAction');

    cy
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.attributes.updated_at = local.format();
        return fx;
      });

    cy
      .get('.action-sidebar')
      .find('[data-save-region]')
      .contains('Save')
      .click();

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
      .get('.action-sidebar')
      .find('[data-save-region]')
      .should('be.empty');

    cy
      .get('.action-sidebar__timestamps')
      .contains('Last Updated')
      .next()
      .should('contain', formatDate(local, 'AT_TIME'));

    cy
      .get('.action-sidebar')
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
      .get('.action-sidebar')
      .should('not.exist');
  });

  specify('display action sidebar', function() {
    const actionData = {
      id: '1',
      attributes: {
        name: 'Name',
        details: 'Details',
        duration: 5,
        due_date: moment(local).subtract(2, 'days').format('YYYY-MM-DD'),
        due_time: null,
        updated_at: now.format(),
      },
      relationships: {
        owner: { data: null },
        state: { data: { id: '22222' } },
      },
    };

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
        fx.data = this.fxEvents;
        fx.data[0].relationships.editor.data = null;
        fx.data[0].attributes.date = now.format();


        return fx;
      })
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
      .wait('@routePatient');

    cy
      .get('.action-sidebar')
      .find('[data-save-region]')
      .should('be.empty');

    cy
      .get('.action-sidebar')
      .find('[data-name-region] .js-input')
      .clear();

    cy
      .get('.action-sidebar')
      .find('[data-save-region]')
      .contains('Save')
      .should('be.disabled');

    cy
      .get('.action-sidebar')
      .find('[data-name-region] .js-input')
      .type('testing name');

    cy
      .get('.action-sidebar')
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
      .get('.action-sidebar')
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
      .get('.action-sidebar')
      .find('[data-save-region]')
      .should('be.empty');

    cy
      .get('.action-sidebar')
      .find('[data-name-region] .js-input')
      .type('cancel this text');

    cy
      .get('.action-sidebar')
      .find('[data-save-region]')
      .contains('Cancel')
      .click();

    cy
      .get('.action-sidebar')
      .find('[data-name-region] .js-input')
      .should('have.value', 'testing name');

    cy
      .get('.action-sidebar')
      .find('[data-save-region]')
      .should('be.empty');

    cy
      .get('.action-sidebar')
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
      .get('.action-sidebar')
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
      .contains('Nurse')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.owner.data.id).to.equal('22222');
        expect(data.relationships.owner.data.type).to.equal('roles');
      });

    cy
      .get('.action-sidebar')
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
      .get('.action-sidebar')
      .find('[data-due-day-region]')
      .contains(formatDate(moment(local).subtract(2, 'days'), 'LONG'))
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
        expect(data.attributes.due_date).to.equal(local.format('YYYY-MM-DD'));
      });

    cy
      .get('.action-sidebar')
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
      .get('.action-sidebar')
      .find('[data-due-day-region]')
      .contains(formatDate(local, 'LONG'))
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
      .get('.action-sidebar')
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
      .get('.action-sidebar')
      .find('[data-state-region]')
      .contains('In Progress')
      .click();

    cy
      .get('.picklist')
      .contains('Done')
      .click();

    cy
      .get('.action-sidebar')
      .should('not.contain', 'Attachment');

    cy
      .get('.action-sidebar__timestamps')
      .contains('Created')
      .next()
      .should('contain', formatDate(local, 'AT_TIME'));

    cy
      .get('.action-sidebar__timestamps')
      .contains('Last Updated')
      .next()
      .should('contain', formatDate(local, 'AT_TIME'));

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
      .should('contain', 'Clinician McTester (Nurse) added the attachment Test Form')
      .should('contain', 'Clinician McTester (Nurse) removed the attachment Test Form')
      .should('contain', 'Clinician McTester (Nurse) worked on the attachment Test Form')
      .should('contain', 'Clinician McTester (Nurse) changed the Due Time to ')
      .should('contain', 'Clinician McTester (Nurse) cleared the Due Time');
  });

  specify('display action from program action', function() {
    cy
      .server()
      .routePatient()
      .routePatientActions()
      .routePatientFlows()
      .routeAction(fx => {
        fx.data.id = '12345';
        fx.data.relationships.program = { data: { id: '1' } };
        fx.data.relationships.form = { data: { id: '11111' } };
        return fx;
      })
      .routeActionActivity(fx => {
        fx.data = [];
        fx.data[0] = this.fxEvents[0];
        fx.data[1] = this.fxEvents[1];
        fx.data[0].relationships.editor.data = null;
        fx.data[0].attributes.date = now.format();

        fx.data.push({
          id: '12345',
          type: 'events',
          attributes: {
            date: now.format(),
            type: 'ActionProgramAssigned',
          },
          relationships: {
            program: { data: { id: '1' } },
            editor: { data: { id: '11111' } },
          },
        });

        return fx;
      })
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
      .wait('@routeProgramByAction');

    cy
      .get('[data-activity-region]')
      .should('contain', 'Clinician McTester (Nurse) added this Action from the Test Program program')
      .children()
      .children()
      .its('length')
      .should('equal', 2);

    cy
      .routeActionPatient();

    cy
      .get('[data-attachment-region] button')
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
      .get('.action-sidebar')
      .should('not.exist');

    cy
      .get('.patient__list');
  });
});
