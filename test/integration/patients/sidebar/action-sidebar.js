import moment from 'moment';

import { getResource } from 'helpers/json-api';
import formatDate from 'helpers/format-date';

const stateColors = Cypress.env('stateColors');
const now = moment.utc();
const local = moment();

context('action sidebar', function() {
  specify('display new action sidebar', function() {
    let currentClinicianId;

    cy
      .server()
      .routePatientActions()
      .routeActionActivity()
      .routePatient()
      .routeCurrentClinician(fx => {
        currentClinicianId = fx.data.id;
        fx.data.attributes = {
          first_name: 'Clinician',
          last_name: 'McTester',
        };

        return fx;
      })
      .visit('/patient/1/action')
      .wait('@routePatientActions')
      .wait('@routePatient');

    cy
      .get('.action-sidebar')
      .find('[data-name-region] .js-input')
      .should('have.attr', 'placeholder', 'New Action');

    cy
      .get('.action-sidebar')
      .find('[data-save-region]')
      .contains('Save')
      .should('be.disabled');

    cy
      .get('.action-sidebar')
      .find('[data-state-region]')
      .contains('Needs Attention')
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
      .visit('/patient/1/action')
      .wait('@routePatientActions')
      .wait('@routePatient');

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
      .get('.action-sidebar')
      .find('[data-save-region]')
      .contains('Save')
      .click();

    cy
      .wait('@routePostAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.state.data.id).to.equal('22222');
        expect(data.relationships.clinician.data.id).to.equal(currentClinicianId);
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
    let currentClinicianId;

    cy
      .server()
      .routeCurrentClinician(fx => {
        currentClinicianId = fx.data.id;
        fx.data.attributes = {
          first_name: 'Clinician',
          last_name: 'McTester',
        };

        return fx;
      })
      .routePatientActions(fx => {
        fx.data[0].id = '1';
        fx.data[0].attributes = {
          name: 'Name',
          details: 'Details',
          duration: 5,
          due_date: moment(now).subtract(1, 'days').format(),
          updated_at: now.format(),
        };
        fx.data[0].relationships.clinician.data = { id: currentClinicianId };
        fx.data[0].relationships.role.data = null;
        fx.data[0].relationships.state.data.id = '22222';
        fx.data[0].relationships.events.data[0].id = '11111';

        return fx;
      }, '1')
      .routeActionActivity(fx => {
        fx.data = getResource(this.fxEvents, 'events');
        fx.data[0].attributes.date = now.format();

        return fx;
      })
      .routePatient()
      .visit('/patient/1/action/1')
      .wait('@routePatientActions')
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
      .find('[data-state-region]')
      .contains('Needs Attention')
      .click();

    cy
      .get('.picklist')
      .contains('Open')
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
        expect(data.relationships.clinician.data.id).to.equal(currentClinicianId);
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
      .contains('Open')
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
      .should('contain', 'Kasey Swaniawski (Nurse) added this Action')
      .should('contain', 'Jarvis Lueilwitz (Other) changed the Owner to Connor Prosacco')
      .should('contain', 'Agnes Brakus (Other) changed the details of this Action')
      .should('contain', 'Cleo Harris (Other) changed the Due Date to ')
      .should('contain', 'Adonis Wisozk (Nurse) changed Duration to 14')
      .should('contain', 'Darrell Breitenberg (Specialist) changed the name of this Action from evolve matrix to transform migration')
      .should('contain', 'Maverick Goldner (Coordinator) changed the Owner to Physician')
      .should('contain', 'Eleazar Grimes (Pharmacist) changed State to Done');
  });
});
