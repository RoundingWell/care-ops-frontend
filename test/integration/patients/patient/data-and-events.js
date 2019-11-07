import _ from 'underscore';
import moment from 'moment';

context('patient data and events page', function() {
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
            patient: { data: { id: '11111' } },
            clinician: { data: { id: '11111' } },
            role: { data: { id: null } },
            state: { data: { id: '55555' } },
          },
        };

        fx.data[1].relationships.state = { data: { id: '33333' } };
        fx.data[1].attributes.name = 'Not In List';
        fx.data[1].attributes.updated_at = moment.utc().subtract(2, 'days').format();

        fx.data[2].relationships.state = { data: { id: '55555' } };
        fx.data[2].attributes.name = 'Last In List';
        fx.data[2].attributes.updated_at = moment.utc().subtract(2, 'days').format();

        fx.data[3].relationships.state = { data: { id: '55555' } };
        fx.data[3].attributes.name = 'Second In List';
        fx.data[3].attributes.updated_at = moment.utc().subtract(1, 'days').format();

        return fx;
      }, '1')
      .routeAction()
      .routeActionActivity()
      .visit('/patient/data-events/1')
      .wait('@routePatient');

    // Filters only done id 55555
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
      .find('[data-owner-region] button')
      .should('contain', 'Clinician M.')
      .should('be.disabled');

    cy
      .get('.patient__list')
      .find('.is-selected')
      .find('[data-due-region] button')
      .should('be.disabled');

    cy
      .get('.patient__list')
      .find('.is-selected')
      .find('[data-state-region]')
      .find('.action--done')
      .click();

    cy
      .get('.picklist')
      .contains('In Progress')
      .click()
      .wait(800); // wait the length of the animation

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.state.data.id).to.equal('33333');
      });

    cy
      .get('.patient__list')
      .find('tr')
      .should('have.lengthOf', 2);

    cy
      .get('.action-sidebar')
      .find('.action--started')
      .click();

    cy
      .get('.picklist')
      .contains('To Do')
      .click();

    cy
      .get('.patient__list')
      .find('tr')
      .should('have.lengthOf', 2);

    cy
      .get('.action-sidebar')
      .find('.action--queued')
      .click();

    cy
      .get('.picklist')
      .contains('Done')
      .click();
    cy
      .get('.patient__list')
      .find('tr')
      .should('have.lengthOf', 3);
  });
});
