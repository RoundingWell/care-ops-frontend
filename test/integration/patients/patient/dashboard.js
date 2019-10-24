import _ from 'underscore';
import moment from 'moment';

context('patient dashboard page', function() {
  specify('action list', function() {
    cy
      .server()
      .routePatient(fx => {
        fx.data.id = '1';

        return fx;
      })
      .routePatientActions(fx => {
        fx.data = _.sample(fx.data, 4);
        fx.data[0] = {
          id: '1',
          attributes: {
            name: 'First In List',
            details: null,
            duration: 0,
            due_date: null,
            updated_at: moment.utc().format(),
          },
          relationships: {
            clinician: { data: null },
            role: { data: { id: '11111' } },
            state: { data: { id: '22222' } },
          },
        };

        fx.data[1].relationships.state = { data: { id: '33333' } };
        fx.data[1].attributes.name = 'Last In List';
        fx.data[1].attributes.updated_at = moment.utc().subtract(2, 'days').format();

        fx.data[2].relationships.state = { data: { id: '55555' } };
        fx.data[2].attributes.name = 'Not In List';
        fx.data[2].attributes.updated_at = moment.utc().subtract(1, 'days').format();

        fx.data[3].relationships.state = { data: { id: '33333' } };
        fx.data[3].attributes.name = 'Second In List';
        fx.data[3].attributes.updated_at = moment.utc().subtract(1, 'days').format();

        return fx;
      }, '1')
      .routeAction()
      .routeActionActivity()
      .visit('/patient/dashboard/1')
      .wait('@routePatient');

    // Filters out done id 55555
    cy
      .get('.patient__list')
      .find('tr')
      .should('have.lengthOf', 3);

    cy
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/actions/1',
        response: {},
      })
      .as('routePatchAction');

    cy
      .get('.patient__list')
      .find('.table-list__item')
      .first()
      .should('contain', 'First In List')
      .next()
      .should('contain', 'Second In List')
      .next()
      .should('contain', 'Last In List');

    cy
      .get('.patient__list')
      .contains('First In List')
      .click();

    cy
      .get('.patient__list')
      .find('.is-selected')
      .find('[data-state-region]')
      .find('.action--queued')
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
      .get('.patient__list')
      .find('.is-selected')
      .find('[data-owner-region]')
      .should('contain', 'CO')
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
      .get('.patient__list')
      .find('.is-selected')
      .find('[data-due-region]')
      .click();

    cy
      .get('.datepicker')
      .contains('Today')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.due_date).to.equal(moment.utc().format('YYYY-MM-DD'));
      });

    cy
      .get('.patient__list')
      .find('.is-selected')
      .find('[data-state-region]')
      .click();

    cy
      .get('.picklist')
      .contains('Done')
      .wait(800) // wait the length of the animation
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.state.data.id).to.equal('55555');
      });

    cy
      .get('.patient__list')
      .find('tr')
      .should('have.lengthOf', 2);
  });
  specify('add action', function() {
    cy
      .server()
      .routePatient(fx => {
        fx.data.id = '1';

        return fx;
      })
      .routeAction()
      .routePatientActions(_.identity, '1')
      .routeActionActivity()
      .visit('/patient/dashboard/1')
      .wait('@routePatient')
      .wait('@routePatientActions');

    cy
      .get('.patient__layout')
      .find('.js-add')
      .click();

    cy
      .get('.patient__list')
      .find('.is-selected')
      .should('contain', 'New Action')
      .as('newAction');

    cy
      .get('@newAction')
      .find('[data-state-region]')
      .find('button')
      .should('be.disabled')
      .find('.action--queued');

    cy
      .get('@newAction')
      .find('[data-owner-region]')
      .find('button')
      .should('be.disabled')
      .should('contain', 'Clinician M.');

    cy
      .get('@newAction')
      .find('[data-due-region]')
      .find('button')
      .should('be.disabled');

    cy
      .get('.action-sidebar')
      .find('.js-close')
      .click();

    cy
      .get('.patient__list')
      .should('not.contain', 'New Action')
      .find('.is-selected')
      .should('not.exist');
  });
});
