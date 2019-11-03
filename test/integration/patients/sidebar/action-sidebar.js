import moment from 'moment';

import formatDate from 'helpers/format-date';

const stateColors = Cypress.env('stateColors');
const now = moment.utc();
const local = moment();

context('action sidebar', function() {
  specify('display new action sidebar', function() {
    cy
      .server()
      .routePatientActions()
      .routeActionActivity()
      .routePatient(fx => {
        fx.data.id = '1';
        return fx;
      })
      .routePrograms()
      .routeAllProgramActions()
      .visit('/patient/1/action')
      .wait('@routePatientActions')
      .wait('@routePatient')
      .wait('@routePrograms')
      .wait('@routeAllProgramActions');

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
      .find('[data-due-region]')
      .contains('Select Date')
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
      .get('[data-add-action-region]')
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
        expect(data.relationships.clinician.data.id).to.equal('11111');
        expect(data.relationships.role.data).to.be.null;
        expect(data.id).to.not.be.null;
        expect(data.attributes.name).to.equal('Test Name');
        expect(data.attributes.details).to.equal('Test\n Details');
        expect(data.attributes.due_date).to.be.null;
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
        updated_at: now.format(),
      },
      relationships: {
        clinician: { data: null },
        role: { data: null },
        state: { data: { id: '22222' } },
      },
    };

    cy
      .server()
      .routeGroups(fx => {
        fx.data[2].relationships.clinicians.data[1] = { id: '22222', type: 'clinicians' };

        fx.included[0] = {
          id: '22222',
          type: 'clinicians',
          attributes: {
            first_name: 'Another',
            last_name: 'Clinician',
          },
        };

        return fx;
      })
      .routeAction(fx => {
        fx.data = actionData;

        fx.data.relationships.clinician.data = { id: '11111' };

        return fx;
      })
      .routePatientActions(fx => {
        fx.data[0] = actionData;

        fx.data[0].relationships.clinician.data = { id: '11111' };

        return fx;
      }, '1')
      .routeActionActivity(fx => {
        fx.data = this.fxEvents;
        fx.data[0].relationships.editor.data = null;
        fx.data[0].attributes.date = now.format();

        return fx;
      })
      .routePatient()
      .visit('/patient/1/action/1')
      .wait('@routePatientActions')
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
        expect(data.id).to.equal('1');
        expect(data.attributes.name).to.equal('testing name');
        expect(data.attributes.details).to.equal('');
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
      .contains('Nurse')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.role.data.id).to.equal('22222');
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
        expect(data.relationships.clinician.data.id).to.equal('11111');
      });

    cy
      .get('.action-sidebar')
      .find('[data-due-region]')
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
      .find('[data-due-region]')
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
      .should('contain', 'Clinician McTester (Nurse) changed State to Done');
  });

  specify('deleted action', function() {
    cy
      .server()
      .routePatient()
      .routePatientActions()
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
      .visit('/patient/1/action/1')
      .wait('@routePatient')
      .wait('@routePatientActions')
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
