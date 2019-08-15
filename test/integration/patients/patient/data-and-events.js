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
        fx.data = _.sample(fx.data, 3);
        fx.data[0] = {
          id: '1',
          attributes: {
            name: 'Test Action',
            details: null,
            duration: 0,
            due_date: null,
            updated_at: moment().format(),
          },
          relationships: {
            clinician: { data: { id: '11111' } },
            role: { data: { id: null } },
            state: { data: { id: '55555' } },
          },
        };

        fx.data[1].relationships.state = { data: { id: '33333' } };
        fx.data[2].relationships.state = { data: { id: '55555' } };

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
      .should('have.lengthOf', 2);

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
      .contains('Test Action')
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
      .contains('Open')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.state.data.id).to.equal('33333');
      });

    cy
      .get('.patient__list')
      .find('tr')
      .should('have.lengthOf', 1);
  });
});
