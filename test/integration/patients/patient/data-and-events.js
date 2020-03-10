import _ from 'underscore';
import moment from 'moment';

context('patient data and events page', function() {
  specify('action and flow list', function() {
    cy
      .server()
      .routeGroupsBootstrap(_.identity, [
        {
          id: '1',
          name: 'Group One',
        },
      ])
      .routePatient(fx => {
        fx.data.id = '1';
        fx.data.relationships.groups.data = [
          {
            id: '1',
            type: 'groups',
          },
        ];

        return fx;
      })
      .routePatientActions(fx => {
        fx.data = _.sample(fx.data, 3);
        fx.data[0] = {
          id: '1',
          attributes: {
            name: 'First In List',
            details: null,
            duration: 0,
            due_date: null,
            due_time: null,
            updated_at: moment.utc().format(),
          },
          relationships: {
            patient: { data: { id: '11111' } },
            owner: {
              data: {
                id: '11111',
                type: 'clinicians',
              },
            },
            state: { data: { id: '55555' } },
            form: { data: { id: '1' } },
          },
        };

        fx.data[2].attributes.name = 'Third In List';
        fx.data[2].relationships.state = { data: { id: '55555' } };
        fx.data[2].attributes.updated_at = moment.utc().subtract(2, 'days').format();

        fx.data[1].attributes.name = 'Not In List';
        fx.data[1].relationships.state = { data: { id: '33333' } };
        fx.data[1].attributes.updated_at = moment.utc().subtract(5, 'days').format();

        return fx;
      }, '1')
      .routePatientFlows(fx => {
        fx.data = _.sample(fx.data, 3);

        fx.data[0].attributes.name = 'Second In List';
        fx.data[0].relationships.state = { data: { id: '55555' } };
        fx.data[0].attributes.updated_at = moment.utc().subtract(1, 'days').format();

        fx.data[2].attributes.name = 'Last In List';
        fx.data[2].id = '2';
        fx.data[2].relationships.state = { data: { id: '55555' } };
        fx.data[2].attributes.updated_at = moment.utc().subtract(5, 'days').format();

        fx.data[1].attributes.name = 'Not In List';
        fx.data[1].relationships.state = { data: { id: '33333' } };
        fx.data[1].attributes.updated_at = moment.utc().subtract(5, 'days').format();

        return fx;
      }, '1')
      .routeAction()
      .routeActionActivity()
      .routePatientByAction()
      .visit('/patient/data-events/1')
      .wait('@routePatient')
      .wait('@routePatientActions')
      .wait('@routePatientFlows');

    // Filters only done id 55555
    cy
      .get('.patient__list')
      .find('tr')
      .should('have.lengthOf', 4);

    cy
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/actions/1',
        response: {},
      })
      .as('routePatchAction');

    cy
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/flows/2',
        response: {},
      })
      .as('routePatchFlow');

    cy
      .get('.patient__list')
      .find('.table-list__item')
      .first()
      .should('contain', 'First In List')
      .next()
      .should('contain', 'Second In List')
      .next()
      .should('contain', 'Third In List')
      .next()
      .should('contain', 'Last In List');

    cy
      .get('.patient__list')
      .should('contain', 'Second In List')
      .find('.patient__flow-icon');

    cy
      .get('.patient__list')
      .contains('First In List')
      .click();

    cy
      .get('.patient__list')
      .find('.is-selected')
      .find('[data-owner-region] button')
      .should('contain', 'Clinician McTester')
      .should('be.disabled');

    cy
      .get('.patient__list')
      .find('.is-selected')
      .find('[data-due-day-region] button')
      .should('be.disabled');

    cy
      .get('.patient__list')
      .find('.is-selected')
      .find('[data-due-time-region] button')
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
      .should('have.lengthOf', 3);

    cy
      .get('.sidebar')
      .find('.action--started')
      .click();

    cy
      .get('.picklist')
      .contains('To Do')
      .click();

    cy
      .get('.patient__list')
      .find('tr')
      .should('have.lengthOf', 3);

    cy
      .get('.sidebar')
      .find('.action--queued')
      .click();

    cy
      .get('.picklist')
      .contains('Done')
      .click();

    cy
      .get('.patient__list')
      .find('tr')
      .should('have.lengthOf', 4);

    cy
      .routeFlow()
      .routePatientByFlow()
      .routeFlowActions();

    cy
      .get('.patient__list')
      .find('.table-list__item')
      .last()
      .as('flowItem');

    cy
      .get('@flowItem')
      .click()
      .wait('@routeFlow')
      .wait('@routeFlowActions')
      .wait('@routePatientByFlow');

    cy
      .url()
      .should('contain', 'flow/2');

    cy
      .go('back');

    cy
      .get('@flowItem')
      .find('.action--done')
      .click();

    cy
      .get('.picklist')
      .contains('To Do')
      .click();

    cy
      .wait('@routePatchFlow')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.state.data.id).to.equal('22222');
      });

    cy
      .get('@flowItem')
      .find('.action--queued');

    cy
      .get('.patient__list')
      .find('tr')
      .should('have.lengthOf', 3);

    cy
      .get('.table-list__item')
      .first()
      .next()
      .next()
      .find('[data-attachment-region]')
      .should('be.empty');

    cy
      .get('.table-list__item')
      .first()
      .find('[data-attachment-region]')
      .click();

    cy
      .url()
      .should('contain', 'patient-action/1/form/1');
  });
});
