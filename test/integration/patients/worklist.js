import _ from 'underscore';
import moment from 'moment';
import 'js/utils/formatting';
import formatDate from 'helpers/format-date';

const testGroups = [
  {
    id: '1',
    name: 'Group One',
  },
  {
    id: '2',
    name: 'Another Group',
  },
  {
    id: '3',
    name: 'Third Group',
  },
];

context('worklist page', function() {
  specify('action list', function() {
    cy
      .fixture('collections/flows').as('fxFlows');

    cy
      .server()
      .routeGroupsBootstrap(_.identity, testGroups)
      .routeGroupActions(fx => {
        const flowInclude = {
          id: '1',
          type: 'flows',
          attributes: _.extend(_.sample(this.fxFlows), {
            name: 'Test Flow',
            id: '1',
          }),
        };

        fx.data = _.sample(fx.data, 3);
        fx.data[0] = {
          id: '1',
          type: 'actions',
          attributes: {
            name: 'First In List',
            details: null,
            duration: 0,
            due_date: null,
            due_time: null,
            updated_at: moment.utc().format(),
          },
          relationships: {
            owner: {
              data: {
                id: '11111',
                type: 'roles',
              },
            },
            state: { data: { id: '22222' } },
            patient: { data: { id: '1' } },
            form: { data: { id: '1' } },
            flow: { data: { id: '1' } },
          },
        };

        fx.data[1].relationships.state = { data: { id: '55555' } };
        fx.data[1].attributes.name = 'Last In List';
        fx.data[1].attributes.due_date = moment.utc().add(5, 'days').format('YYYY-MM-DD');
        fx.data[1].attributes.updated_at = moment.utc().subtract(2, 'days').format();

        fx.data[2] = {
          id: '2',
          type: 'actions',
          attributes: {
            name: 'Second In List',
            details: null,
            duration: 0,
            due_date: moment.utc().add(3, 'days').format('YYYY-MM-DD'),
            due_time: null,
            updated_at: moment.utc().subtract(1, 'days').format(),
          },
          relationships: {
            owner: {
              data: {
                id: '11111',
                type: 'roles',
              },
            },
            state: { data: { id: '22222' } },
            patient: { data: { id: '1' } },
            form: { data: { id: '1' } },
          },
        };

        fx.included.push({
          id: '1',
          type: 'patients',
          attributes: {
            first_name: 'Test',
            last_name: 'Patient',
          },
          relationships: {
            groups: {
              data: [testGroups[0]],
            },
          },
        });


        fx.included.push(flowInclude);

        return fx;
      }, '1')
      .routePatient()
      .routePatientActions()
      .routeAction()
      .routeActionActivity()
      .routePatientFlows()
      .routeActionPatient()
      .routePrograms()
      .routeAllProgramActions()
      .routeAllProgramFlows()
      .visit('/worklist/owned-by-me')
      .wait('@routeGroupActions');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .should('contain', 'First In List')
      .should('contain', 'Test Flow')
      .next()
      .should('contain', 'Second In List')
      .next()
      .should('contain', 'Last In List');

    cy
      .route({
        status: 204,
        method: 'GET',
        url: '/api/flows/1',
        response: {},
      })
      .as('routeFlow');

    cy
      .route({
        status: 204,
        method: 'GET',
        url: '/api/flows/1/patient',
        response: {},
      })
      .as('routeFlowPatient');

    cy
      .route({
        status: 204,
        method: 'GET',
        url: '/api/flows/1/relationships/actions',
        response: {},
      })
      .as('routeFlowActions');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .as('firstRow')
      .click()
      .wait('@routeFlow')
      .wait('@routeFlowActions')
      .wait('@routeFlowPatient');

    cy
      .url()
      .should('contain', 'flow/1/action/1');

    cy
      .go('back')
      .wait('@routeGroupActions');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .next()
      .as('secondRow')
      .click();

    cy
      .url()
      .should('contain', 'patient/1/action/2')
      .wait('@routePatientActions');

    cy
      .get('.patient__layout')
      .find('.patient__tab--selected')
      .contains('Dashboard');

    cy
      .go('back')
      .wait('@routeGroupActions');

    cy
      .get('@firstRow')
      .contains('Test Patient')
      .click();

    cy
      .url()
      .should('contain', 'patient/dashboard/1')
      .wait('@routePatientActions');

    cy
      .go('back')
      .wait('@routeGroupActions');

    cy
      .get('@secondRow')
      .next()
      .click();

    cy
      .url()
      .wait('@routePatientActions');

    cy
      .get('.patient__layout')
      .find('.patient__tab--selected')
      .contains('Data & Events');

    cy
      .go('back')
      .wait('@routeGroupActions');

    cy
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/actions/1',
        response: {},
      })
      .as('routePatchAction');

    cy
      .get('@firstRow')
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
      .get('@firstRow')
      .find('[data-owner-region]')
      .should('contain', 'CO')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__heading')
      .should('contain', 'Group One');

    cy
      .get('.picklist')
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
      .get('@firstRow')
      .find('[data-due-day-region]')
      .click();

    cy
      .get('.datepicker')
      .contains('Today')
      .click();

    cy
      .get('@firstRow')
      .find('[data-due-day-region]')
      .should('contain', formatDate(moment(), 'SHORT'));

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.due_date).to.equal(moment().format('YYYY-MM-DD'));
      });

    cy
      .get('@firstRow')
      .find('[data-due-time-region]')
      .click();

    cy
      .get('.picklist')
      .contains('9:30 AM')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.due_time).to.equal('09:30:00');
      });

    cy
      .get('@firstRow')
      .find('[data-due-day-region]')
      .click();

    cy
      .get('.datepicker')
      .contains('Clear')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.due_date).to.be.equal(null);
        expect(data.attributes.due_time).to.be.equal(null);
      });

    cy
      .get('@firstRow')
      .find('[data-due-time-region] button')
      .should('be.disabled');

    cy
      .get('@secondRow')
      .next()
      .find('.action--done')
      .should('not.be.disabled');

    cy
      .get('@secondRow')
      .next()
      .find('[data-owner-region] button')
      .should('be.disabled');

    cy
      .get('@secondRow')
      .next()
      .find('[data-due-day-region] button')
      .should('be.disabled');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .last()
      .find('[data-attachment-region]')
      .should('be.empty');

    cy
      .get('@secondRow')
      .find('[data-attachment-region] button')
      .click();

    cy
      .url()
      .should('contain', 'patient-action/2/form/1');

    cy
      .visit('/worklist/powned-by-me')
      .url()
      .should('contain', '404');
  });

  specify('group filtering', function() {
    cy
      .server()
      .routeGroupsBootstrap(_.identity, testGroups)
      .routeGroupActions()
      .visit('/worklist/owned-by-me')
      .wait('@routeGroupActions')
      .its('url')
      .should('contain', 'filter[group]=1,2,3')
      .should('contain', 'filter[clinician]=11111')
      .should('contain', 'filter[status]=queued,started');

    cy
      .get('.list-page__filters')
      .contains('All Groups')
      .click();

    cy
      .get('.picklist__item')
      .contains('Another Group')
      .click()
      .wait('@routeGroupActions')
      .its('url')
      .should('contain', 'filter[group]=2')
      .should('contain', 'filter[clinician]=11111')
      .should('contain', 'filter[status]=queued,started');

    cy
      .get('.list-page__filters')
      .contains('Another Group');
  });

  specify('group filtering - new actions', function() {
    cy
      .server()
      .routeGroupsBootstrap(_.identity, testGroups)
      .routeGroupActions()
      .visit('/worklist/new-past-day')
      .wait('@routeGroupActions')
      .its('url')
      .should('contain', 'filter[group]=1,2,3')
      .should('contain', 'filter[created_since]=')
      .should('contain', 'filter[status]=queued,started');

    cy
      .get('.list-page__filters')
      .contains('All Groups')
      .click();

    cy
      .get('.picklist__item')
      .contains('Another Group')
      .click()
      .wait('@routeGroupActions')
      .its('url')
      .should('contain', 'filter[group]=2')
      .should('contain', 'filter[created_since]=')
      .should('contain', 'filter[status]=queued,started');
  });

  specify('clinician in only one group', function() {
    cy
      .server()
      .routeGroupsBootstrap(_.identity, [testGroups[0]])
      .routeGroupActions()
      .visit('/worklist/owned-by-me')
      .wait('@routeGroupActions')
      .its('url')
      .should('contain', 'filter[group]=1');

    cy
      .get('[data-filters-region]')
      .should('be.empty');
  });

  specify('action sorting', function() {
    cy
      .server()
      .routeGroupActions(fx => {
        fx.data = _.sample(fx.data, 6);

        fx.data[0].relationships.state = { data: { id: '33333' } };
        fx.data[0].attributes.name = 'Updated Most Recent';
        fx.data[0].attributes.due_date = moment.utc().add(3, 'days').format('YYYY-MM-DD');
        fx.data[0].attributes.due_time = null;
        fx.data[0].attributes.updated_at = moment.utc().subtract(1, 'days').format();

        fx.data[1].relationships.state = { data: { id: '33333' } };
        fx.data[1].attributes.name = 'Updated Least Recent';
        fx.data[1].attributes.due_date = moment.utc().add(3, 'days').format('YYYY-MM-DD');
        fx.data[1].attributes.due_time = null;
        fx.data[1].attributes.updated_at = moment.utc().subtract(10, 'days').format();

        fx.data[2].relationships.state = { data: { id: '33333' } };
        fx.data[2].attributes.name = 'Due Date Least Recent';
        fx.data[2].attributes.due_date = moment.utc().add(1, 'days').format('YYYY-MM-DD');
        fx.data[2].attributes.due_time = null;
        fx.data[2].attributes.updated_at = moment.utc().subtract(3, 'days').format();

        fx.data[3].relationships.state = { data: { id: '33333' } };
        fx.data[3].attributes.name = 'Due Date Most Recent';
        fx.data[3].attributes.due_date = moment.utc().add(10, 'days').format('YYYY-MM-DD');
        fx.data[3].attributes.due_time = null;
        fx.data[3].attributes.updated_at = moment.utc().subtract(3, 'days').format();

        fx.data[4].relationships.state = { data: { id: '33333' } };
        fx.data[4].attributes.name = 'Due Time Most Recent';
        fx.data[4].attributes.due_date = moment.utc().add(2, 'days').format('YYYY-MM-DD');
        fx.data[4].attributes.due_time = '11:00:00';
        fx.data[4].attributes.updated_at = moment.utc().subtract(3, 'days').format();

        fx.data[5].relationships.state = { data: { id: '33333' } };
        fx.data[5].attributes.name = 'Due Time Least Recent';
        fx.data[5].attributes.due_date = moment.utc().add(2, 'days').format('YYYY-MM-DD');
        fx.data[5].attributes.due_time = '12:15:00';
        fx.data[5].attributes.updated_at = moment.utc().subtract(3, 'days').format();

        return fx;
      }, '1')
      .routePatient()
      .routePatientActions()
      .routeAction()
      .routeActionActivity()
      .visit('/worklist/owned-by-me')
      .wait('@routeGroupActions');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .should('contain', 'Updated Most Recent');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .last()
      .should('contain', 'Updated Least Recent');

    cy
      .get('.worklist-list__filter')
      .click()
      .get('.picklist')
      .contains('Last Updated: Oldest - Newest')
      .click();

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .should('contain', 'Updated Least Recent');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .last()
      .should('contain', 'Updated Most Recent');

    cy
      .get('.worklist-list__filter')
      .click()
      .get('.picklist')
      .contains('Last Updated: Newest - Oldest')
      .click();

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .should('contain', 'Updated Most Recent');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .last()
      .should('contain', 'Updated Least Recent');

    cy
      .get('.worklist-list__filter')
      .click()
      .get('.picklist')
      .contains('Due Date: Oldest - Newest')
      .click();

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .next()
      .should('contain', 'Due Time Most Recent');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .next()
      .next()
      .should('contain', 'Due Time Least Recent');

    cy
      .get('.worklist-list__filter')
      .click()
      .get('.picklist')
      .contains('Due Date: Newest - Oldest')
      .click();

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .last()
      .prev()
      .should('contain', 'Due Time Most Recent');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .last()
      .prev()
      .prev()
      .should('contain', 'Due Time Least Recent');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .should('contain', 'Due Date Most Recent');
  });
});
