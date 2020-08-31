import _ from 'underscore';
import moment from 'moment';

import formatDate from 'helpers/format-date';

const tomorrow = moment.utc().add(1, 'days').format('YYYY-MM-DD');

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

context('Worklist bulk editing', function() {
  specify('displaying common groups', function() {
    cy
      .server()
      .routeGroupsBootstrap(_.identity, testGroups)
      .routeFlows(fx => {
        fx.data = _.sample(fx.data, 3);

        fx.data[0].relationships.patient = { data: { id: '1' } };
        fx.data[1].relationships.patient = { data: { id: '2' } };
        fx.data[2].relationships.patient = { data: { id: '3' } };

        fx.included = fx.included.concat([
          {
            id: '1',
            type: 'patients',
            attributes: {
              first_name: 'Patient',
              last_name: 'One',
            },
            relationships: {
              groups: {
                data: [testGroups[0]],
              },
            },
          },
          {
            id: '2',
            type: 'patients',
            attributes: {
              first_name: 'Patient',
              last_name: 'Two',
            },
            relationships: {
              groups: {
                data: [testGroups[0], testGroups[1]],
              },
            },
          },
          {
            id: '3',
            type: 'patients',
            attributes: {
              first_name: 'Patient',
              last_name: 'Three',
            },
            relationships: {
              groups: {
                data: [testGroups[2]],
              },
            },
          },
        ]);

        return fx;
      }, '1')
      .visit('/worklist/owned-by')
      .wait('@routeFlows');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .contains('Patient One')
      .prev()
      .click();

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .contains('Patient Two')
      .prev()
      .click();

    cy
      .get('.worklist-list__filter-region')
      .find('.js-bulk-edit')
      .click();

    cy
      .get('.modal--sidebar')
      .as('sidebar')
      .find('[data-owner-region]')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__group')
      .should('have.length', 2)
      .find('.picklist__heading')
      .first()
      .should('contain', 'Group One');

    cy
      .get('.picklist')
      .find('.picklist__info')
      .should('not.exist');

    cy
      .get('@sidebar')
      .find('.js-close')
      .first()
      .click();

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .contains('Patient Three')
      .prev()
      .click();

    cy
      .get('.worklist-list__filter-region')
      .find('.js-bulk-edit')
      .click();

    cy
      .get('@sidebar')
      .find('[data-owner-region]')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__group')
      .should('have.length', 1)
      .find('.picklist__heading')
      .should('contain', 'Roles');

    cy
      .get('.picklist')
      .find('.picklist__info')
      .should('contain', 'Tip: To assign a clinician, filter the worklist to a specific group.');
  });

  specify('date and time components', function() {
    cy
      .server()
      .routeGroupsBootstrap(_.identity, testGroups)
      .routeFlows()
      .routeActions(fx => {
        const flowInclude = {
          id: '1',
          type: 'flows',
          attributes: _.extend(_.sample(this.fxFlows), {
            name: 'Test Flow',
            id: '1',
          }),
        };

        fx.data = _.sample(fx.data, 4);

        fx.data[0].id = '1';
        fx.data[0].attributes.name = 'First In List';
        fx.data[0].attributes.due_date = moment.utc().add(5, 'days').format('YYYY-MM-DD');
        fx.data[0].attributes.updated_at = moment.utc().subtract(1, 'days').format();
        fx.data[0].attributes.due_time = null;

        fx.data[1].id = '3';
        fx.data[1].attributes.name = 'Last In List';
        fx.data[1].attributes.due_date = null;
        fx.data[1].attributes.updated_at = null;
        fx.data[1].attributes.due_time = null;

        fx.data[2].id = '2';
        fx.data[2].attributes.name = 'Second In List';
        fx.data[2].attributes.due_date = moment.utc().add(3, 'days').format('YYYY-MM-DD');
        fx.data[2].attributes.updated_at = moment.utc().subtract(2, 'days').format();
        fx.data[2].attributes.due_time = '07:00:00';

        fx.data[3].id = '4';
        fx.data[3].attributes.name = 'Third In List';
        fx.data[3].attributes.due_date = moment.utc().add(3, 'days').format('YYYY-MM-DD');
        fx.data[3].attributes.updated_at = moment.utc().subtract(2, 'days').format();
        fx.data[3].attributes.due_time = '07:00:00';


        fx.included.push(flowInclude);

        return fx;
      }, '1')
      .routeFlow()
      .routeFlowActions()
      .visit('/worklist/owned-by')
      .wait('@routeFlows');

    cy
      .get('.worklist-list__toggle')
      .find('.worklist-list__toggle-actions')
      .contains('Actions')
      .click();

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .eq(1)
      .find('.js-select')
      .click();

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .eq(2)
      .find('.js-select')
      .click();

    cy
      .get('.worklist-list__filter-region')
      .find('.js-bulk-edit')
      .click();

    cy
      .get('.modal--sidebar')
      .as('sidebar')
      .find('[data-due-date-region]')
      .should('contain', formatDate(moment().add(3, 'days'), 'LONG'));

    cy
      .get('@sidebar')
      .find('[data-due-time-region]')
      .should('contain', '7:00 AM');

    cy
      .get('.modal--sidebar')
      .as('sidebar')
      .find('[data-due-date-region]')
      .click();

    cy
      .get('.datepicker')
      .find('.js-clear')
      .click();

    cy
      .get('@sidebar')
      .find('[data-due-time-region] button')
      .should('be.disabled');

    cy
      .get('@sidebar')
      .find('.js-close')
      .first()
      .click();

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .eq(2)
      .find('.js-select')
      .click();

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .eq(3)
      .find('.js-select')
      .click();

    cy
      .get('.worklist-list__filter-region')
      .find('.js-bulk-edit')
      .click();

    cy
      .get('@sidebar')
      .find('[data-due-time-region] button')
      .should('be.disabled');

    cy
      .get('.modal--sidebar')
      .as('sidebar')
      .find('[data-due-date-region]')
      .click();

    cy
      .get('.datepicker')
      .find('.js-tomorrow')
      .click();

    cy
      .get('@sidebar')
      .find('[data-due-time-region]')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains('7:00 AM')
      .click();

    cy
      .get('@sidebar')
      .find('[data-due-time-region]')
      .click();

    cy
      .get('.picklist')
      .find('.js-clear')
      .click();


    cy
      .get('@sidebar')
      .find('.js-close')
      .first()
      .click();

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .eq(1)
      .find('.js-select')
      .click();

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .find('.js-select')
      .click();

    cy
      .get('.worklist-list__filter-region')
      .find('.js-bulk-edit')
      .click();
  });

  specify('bulk flows editing', function() {
    cy
      .server()
      .routeGroupsBootstrap(_.identity, testGroups)
      .routeFlows(fx => {
        fx.data = _.sample(fx.data, 3);
        fx.data[0] = {
          id: '1',
          type: 'flows',
          attributes: {
            name: 'First In List',
            details: null,
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
          meta: {
            progress: {
              complete: 0,
              total: 2,
            },
          },
        };

        fx.data[1].id = '3';
        fx.data[1].relationships.state = { data: { id: '33333' } };
        fx.data[1].relationships.owner = {
          data: {
            id: '22222',
            type: 'roles',
          },
        };
        fx.data[1].meta.progress = { complete: 2, total: 2 };
        fx.data[1].attributes.name = 'Last In List';
        fx.data[1].attributes.updated_at = moment.utc().subtract(2, 'days').format();

        fx.data[2] = {
          id: '2',
          type: 'flows',
          attributes: {
            name: 'Second In List',
            details: null,
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
          meta: {
            progress: {
              complete: 2,
              total: 10,
            },
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

        return fx;
      }, '1')
      .routeActions()
      .routeFlow()
      .routeFlowActions()
      .visit('/worklist/owned-by')
      .wait('@routeFlows');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .as('firstRow')
      .find('.js-select')
      .click();

    cy
      .get('.worklist-list__select-all')
      .click()
      .next()
      .find('.js-bulk-edit')
      .click();

    cy
      .get('.modal--sidebar')
      .as('bulkEditSidebar')
      .find('.modal-header')
      .should('contain', 'Edit 3 Flows');

    cy
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/flows/*',
        response: {},
      });

    cy
      .get('@bulkEditSidebar')
      .find('.js-submit')
      .click();

    cy
      .get('@firstRow')
      .find('.js-select')
      .click();

    cy
      .get('.worklist-list__select-all')
      .click()
      .next()
      .find('.js-bulk-edit')
      .click();

    cy
      .get('@bulkEditSidebar')
      .find('[data-state-region]')
      .should('contain', 'Multiple States...')
      .parents('.bulk-edit__body')
      .find('[data-owner-region]')
      .should('contain', 'Multiple Owners...');

    cy
      .get('@bulkEditSidebar')
      .find('[data-state-region]')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains('To Do')
      .click();

    cy
      .get('@bulkEditSidebar')
      .find('[data-state-region]')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains('Done')
      .click();

    cy
      .get('.modal--small')
      .should('contain', 'Set Flows to Done?')
      .should('contain', 'There are actions not done on some of these Flows. Are you sure you want to set the Flows to done?')
      .find('.js-submit')
      .click();

    cy
      .get('@bulkEditSidebar')
      .find('[data-owner-region]')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains('Nurse')
      .click();

    cy
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/flows/1',
        response: {},
      })
      .as('patchFlow1')
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/flows/2',
        response: {},
      })
      .as('patchFlow2')
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/flows/3',
        response: {},
      })
      .as('patchFlow3');

    cy
      .get('@bulkEditSidebar')
      .find('.js-submit')
      .click();

    cy
      .wait('@patchFlow1')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.state.data.id).to.equal('55555');
        expect(data.relationships.owner.data.id).to.equal('22222');
      });

    cy
      .wait('@patchFlow2')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.state.data.id).to.equal('55555');
        expect(data.relationships.owner.data.id).to.equal('22222');
      });

    cy
      .wait('@patchFlow3')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.state.data.id).to.equal('55555');
        expect(data.relationships.owner.data.id).to.equal('22222');
      });

    cy
      .get('.alert-box')
      .should('contain', '3 Flows have been updated');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .last()
      .find('.js-select')
      .click();

    cy
      .get('.worklist-list__filter-region')
      .as('filterRegion')
      .find('.js-bulk-edit')
      .click();

    cy
      .get('@bulkEditSidebar')
      .find('[data-state-region]')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains('Done')
      .click();

    cy
      .get('@bulkEditSidebar')
      .find('.js-submit')
      .click();

    cy
      .get('@firstRow')
      .find('.js-select')
      .click();

    cy
      .get('.worklist-list__select-all')
      .click();

    cy
      .get('@filterRegion')
      .find('.js-bulk-edit')
      .click();

    cy
      .route({
        status: 204,
        method: 'DELETE',
        url: '/api/flows/1',
        response: {},
      })
      .route({
        status: 204,
        method: 'DELETE',
        url: '/api/flows/2',
        response: {},
      })
      .route({
        status: 204,
        method: 'DELETE',
        url: '/api/flows/3',
        response: {},
      });

    cy
      .get('@bulkEditSidebar')
      .find('.js-menu')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains('Delete Flows')
      .click();

    cy
      .get('.modal--small')
      .should('contain', 'Delete Flows?')
      .should('contain', 'Are you sure you want to delete the selected Flows? This cannot be undone.')
      .find('.js-submit')
      .click();

    cy
      .get('.alert-box')
      .should('contain', '3 Flows have been deleted');

    cy
      .get('.modal--small')
      .should('not.exist');

    cy
      .get('.modal--sidebar')
      .should('not.exist');

    cy
      .get('@filterRegion')
      .find('.js-bulk-edit')
      .should('not.exist');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .should('have.length', 0);

    cy
      .get('.worklist-list__select-all')
      .find('button')
      .should('be.disabled');
  });

  specify('bulk actions editing', function() {
    cy
      .server()
      .routeGroupsBootstrap(_.identity, testGroups)
      .routeFlows()
      .routeActions(fx => {
        const flowInclude = {
          id: '1',
          type: 'flows',
          attributes: _.extend(_.sample(this.fxFlows), {
            name: 'Test Flow',
            id: '1',
          }),
        };

        fx.data = _.sample(fx.data, 4);
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

        fx.data[1].id = '3';
        fx.data[1].relationships.state = { data: { id: '55555' } };
        fx.data[1].attributes.name = 'Last In List';
        fx.data[1].attributes.due_date = moment.utc().add(5, 'days').format('YYYY-MM-DD');
        fx.data[1].attributes.updated_at = moment.utc().subtract(2, 'days').format();
        fx.data[1].relationships.patient = { data: { id: '2' } };

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

        fx.data[3].id = '4';

        fx.included.push(flowInclude);

        return fx;
      }, '1')
      .routeFlow()
      .routeFlowActions()
      .visit('/worklist/owned-by')
      .wait('@routeFlows');

    cy
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/actions/*',
        response: {},
      });

    cy
      .get('.worklist-list__toggle')
      .find('.worklist-list__toggle-actions')
      .contains('Actions')
      .click();

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .as('firstRow')
      .find('.js-select')
      .click();

    cy
      .get('.worklist-list__select-all')
      .click()
      .next()
      .find('.js-bulk-edit')
      .click();

    cy
      .get('.modal--sidebar')
      .as('bulkEditSidebar')
      .find('.js-submit')
      .click();

    cy
      .get('@firstRow')
      .find('.js-select')
      .click();

    cy
      .get('.worklist-list__select-all')
      .click()
      .next()
      .find('.js-bulk-edit')
      .click();

    cy
      .get('@bulkEditSidebar')
      .find('.sidebar__heading')
      .should('contain', 'Edit 4 Actions');

    cy
      .get('@bulkEditSidebar')
      .find('[data-state-region]')
      .should('contain', 'Multiple States...')
      .parents('.bulk-edit__body')
      .find('[data-owner-region]')
      .should('contain', 'Multiple Owners...')
      .parents('.bulk-edit__body')
      .find('[data-due-date-region]')
      .should('contain', 'Multiple Dates...')
      .parents('.bulk-edit__body')
      .find('[data-due-time-region]')
      .should('contain', 'Multiple Times...')
      .parents('.bulk-edit__body')
      .find('[data-duration-region]')
      .should('contain', 'Multiple Durations...');

    cy
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/actions/1',
        response: {},
      })
      .as('patchAction1')
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/actions/2',
        response: {},
      })
      .as('patchAction2')
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/actions/3',
        response: {},
      })
      .as('patchAction3')
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/actions/4',
        response: {},
      })
      .as('patchAction4');

    cy
      .get('@bulkEditSidebar')
      .find('[data-state-region]')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains('To Do')
      .click();

    cy
      .get('@bulkEditSidebar')
      .find('[data-owner-region]')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains('Nurse')
      .click();

    cy
      .get('@bulkEditSidebar')
      .find('[data-due-date-region]')
      .click();

    cy
      .get('.datepicker')
      .find('.js-tomorrow')
      .click();

    cy
      .get('@bulkEditSidebar')
      .find('[data-due-time-region]')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains('10:00 AM')
      .click();

    cy
      .get('@bulkEditSidebar')
      .find('[data-duration-region]')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains('5 mins')
      .click();

    cy
      .get('@bulkEditSidebar')
      .find('.js-submit')
      .click();

    cy
      .wait('@patchAction1')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.duration).to.equal(5);
        expect(data.attributes.due_time).to.equal('10:00:00');
        expect(moment(data.attributes.due_date).utc().format('YYYY-MM-DD')).to.equal(tomorrow);
        expect(data.relationships.state.data.id).to.equal('22222');
        expect(data.relationships.owner.data.id).to.equal('22222');
      });

    cy
      .wait('@patchAction2')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.duration).to.equal(5);
        expect(data.attributes.due_time).to.equal('10:00:00');
        expect(moment(data.attributes.due_date).utc().format('YYYY-MM-DD')).to.equal(tomorrow);
        expect(data.relationships.state.data.id).to.equal('22222');
        expect(data.relationships.owner.data.id).to.equal('22222');
      });

    cy
      .wait('@patchAction3')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.duration).to.equal(5);
        expect(data.attributes.due_time).to.equal('10:00:00');
        expect(moment(data.attributes.due_date).utc().format('YYYY-MM-DD')).to.equal(tomorrow);
        expect(data.relationships.state.data.id).to.equal('22222');
        expect(data.relationships.owner.data.id).to.equal('22222');
      });

    cy
      .wait('@patchAction4')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.duration).to.equal(5);
        expect(data.attributes.due_time).to.equal('10:00:00');
        expect(moment(data.attributes.due_date).utc().format('YYYY-MM-DD')).to.equal(tomorrow);
        expect(data.relationships.state.data.id).to.equal('22222');
        expect(data.relationships.owner.data.id).to.equal('22222');
      });

    cy
      .get('.alert-box')
      .should('contain', '4 Actions have been updated');

    cy
      .get('.table-list')
      .find('.table-list__item .js-select')
      .click({ multiple: true });

    cy
      .get('.table-list')
      .find('.table-list__item .js-select')
      .last()
      .click();

    cy
      .get('.worklist-list__filter-region')
      .as('filterRegion')
      .find('.js-bulk-edit')
      .click();

    cy
      .route({
        status: 204,
        method: 'DELETE',
        url: '/api/actions/*',
        response: {},
      });

    cy
      .get('.modal--sidebar')
      .find('.modal-header')
      .should('contain', 'Edit 3 Actions')
      .find('.js-menu')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains('Delete Actions')
      .click();

    cy
      .get('.modal--small')
      .should('contain', 'Delete Actions?')
      .should('contain', 'Are you sure you want to delete the selected Actions? This cannot be undone.')
      .find('.js-submit')
      .click();

    cy
      .get('.alert-box')
      .should('contain', '3 Actions have been deleted');

    cy
      .get('.modal--small')
      .should('not.exist');

    cy
      .get('.modal--sidebar')
      .should('not.exist');

    cy
      .get('@filterRegion')
      .find('.js-bulk-edit')
      .should('not.exist');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .should('have.length', 1)
      .first()
      .find('.js-select')
      .click();

    cy
      .get('@filterRegion')
      .find('.js-bulk-edit')
      .click();

    cy
      .route({
        status: 404,
        method: 'PATCH',
        url: '/api/actions/*',
        response: {},
      })
      .as('failedPatchAction');

    cy
      .get('@bulkEditSidebar')
      .find('[data-due-time-region]')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains('10:00 AM')
      .click();

    cy
      .get('@bulkEditSidebar')
      .find('[data-due-date-region]')
      .click();

    cy
      .get('.datepicker')
      .find('.js-clear')
      .click();

    cy
      .get('@bulkEditSidebar')
      .find('.js-submit')
      .click();

    cy
      .get('.alert-box')
      .should('contain', 'Something went wrong. Please try again.');
  });
});
