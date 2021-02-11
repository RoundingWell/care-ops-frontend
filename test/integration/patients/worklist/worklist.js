import _ from 'underscore';
import dayjs from 'dayjs';

import formatDate from 'helpers/format-date';
import { testTs, testTsAdd, testTsSubtract } from 'helpers/test-timestamp';
import { testDate, testDateAdd, testDateSubtract } from 'helpers/test-date';

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
  specify('flow list', function() {
    localStorage.setItem('owned-by_11111', JSON.stringify({
      actionsSortId: 'sortUpdateDesc',
      flowsSortId: 'sortUpdateDesc',
      filters: {
        type: 'flows',
        groupId: null,
        clinicianId: '11111',
      },
      selectedActions: {},
      selectedFlows: {
        '1': true,
      },
    }));

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
            updated_at: testTs(),
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

        fx.data[1].relationships.state = { data: { id: '33333' } };
        fx.data[1].relationships.owner = {
          data: {
            id: '11111',
            type: 'roles',
          },
        };
        fx.data[1].attributes.name = 'Last In List';
        fx.data[1].attributes.updated_at = testTsSubtract(2);

        fx.data[2] = {
          id: '2',
          type: 'flows',
          attributes: {
            name: 'Second In List',
            details: null,
            updated_at: testTsSubtract(1),
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
      .get('.worklist-list__filter-region')
      .as('filterRegion')
      .find('.js-bulk-edit')
      .should('contain', 'Edit 1 Flow');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .as('firstRow')
      .should('have.class', 'is-selected')
      .find('.js-select')
      .click();

    cy
      .get('@filterRegion')
      .contains('All Groups');

    cy
      .get('@firstRow')
      .find('.js-select')
      .click();

    cy
      .get('.worklist-list__select-all')
      .click();

    cy
      .get('.app-frame__content')
      .find('.table-list__item.is-selected')
      .should('have.length', 3);

    cy
      .get('.worklist-list__select-all')
      .click();

    cy
      .get('@firstRow')
      .find('.js-select')
      .click();

    cy
      .get('.worklist-list__select-all')
      .click();

    cy
      .get('@firstRow')
      .find('.js-select')
      .click();

    cy
      .get('.worklist-list__select-all')
      .should('not.be.checked')
      .next()
      .find('button')
      .should('contain', 'Edit 2 Flows')
      .next()
      .click();

    cy
      .get('.app-frame__content')
      .find('.table-list__item.is-selected')
      .should('have.length', 0);

    cy
      .get('.table-list')
      .find('.table-list__item')
      .first()
      .as('firstRow');

    cy
      .get('.worklist-list__toggle')
      .find('.worklist-list__toggle-actions')
      .should('not.have.class', 'button--blue')
      .should('contain', 'Actions')
      .next()
      .should('contain', 'Flows')
      .should('have.class', 'button--blue');

    cy
      .get('.list-page__header')
      .find('.table-list__header')
      .eq(2)
      .should('contain', 'Flow')
      .next()
      .should('contain', 'State, Owner');

    cy
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/flows/1',
        response: {},
      })
      .as('routePatchFlow');

    cy
      .get('@firstRow')
      .find('.worklist-list__flow-progress')
      .should('have.value', 0);

    cy
      .get('@firstRow')
      .find('.worklist-list__flow-progress')
      .should('have.attr', 'max', '2');

    cy
      .get('@firstRow')
      .find('.fa-exclamation-circle')
      .should('not.match', 'button');

    cy
      .get('@firstRow')
      .find('[data-owner-region]')
      .should('contain', 'CO')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__group')
      .first()
      .should('contain', 'Clinician McTester')
      .next()
      .find('.picklist__heading')
      .should('contain', 'Group One');

    cy
      .get('.picklist')
      .contains('Nurse')
      .click();

    cy
      .wait('@routePatchFlow')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.owner.data.id).to.equal('22222');
        expect(data.relationships.owner.data.type).to.equal('roles');
      });

    cy
      .get('@firstRow')
      .click()
      .wait('@routeFlow')
      .wait('@routeFlowActions');

    cy
      .url()
      .should('contain', 'flow/1');

    cy
      .go('back');

    cy
      .get('.worklist-list__toggle')
      .find('.worklist-list__toggle-actions')
      .click()
      .wait('@routeActions');

    cy
      .get('.worklist-list__toggle')
      .find('.worklist-list__toggle-flows')
      .click()
      .wait('@routeFlows');
  });

  specify('done flow list', function() {
    cy
      .server()
      .routeGroupsBootstrap(_.identity, testGroups)
      .routeFlows(fx => {
        fx.data = _.sample(fx.data, 3);

        _.each(fx.data, (flow, idx) => {
          flow.relationships.state.data.id = '55555';
        });

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
      .visit('/worklist/done-last-thirty-days')
      .wait('@routeFlows');

    cy
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/flows/*',
        response: {},
      })
      .as('routePatchFlow');

    cy
      .get('.table-list')
      .find('.table-list__item')
      .first()
      .as('firstRow');

    cy
      .get('@firstRow')
      .find('[data-state-region] button')
      .click();

    cy
      .get('.picklist')
      .contains('In Progress')
      .click();

    cy
      .wait('@routePatchFlow')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.state.data.id).to.equal('33333');
      });
  });

  specify('action list', function() {
    const testTime = dayjs().hour(10).utc().valueOf();
    localStorage.setItem('owned-by_11111', JSON.stringify({
      actionsSortId: 'sortUpdateDesc',
      flowsSortId: 'sortUpdateDesc',
      filters: {
        type: 'flows',
        groupId: null,
        clinicianId: '11111',
      },
      selectedActions: {
        '1': true,
      },
      selectedFlows: {},
    }));

    cy
      .fixture('collections/flows').as('fxFlows');

    cy
      .server()
      .routeGroupsBootstrap(_.identity, testGroups)
      .routeActions(fx => {
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
            updated_at: testTs(),
            created_at: testTsSubtract(1),
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
        fx.data[1].attributes.due_date = testDateAdd(5);
        fx.data[1].attributes.updated_at = testTsSubtract(2);

        fx.data[2] = {
          id: '2',
          type: 'actions',
          attributes: {
            name: 'Second In List',
            details: null,
            duration: 0,
            due_date: testDateAdd(3),
            due_time: '10:00:00',
            updated_at: testTsSubtract(1),
            created_at: testTsSubtract(2),
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
      .routePatient(fx => {
        fx.data.id = '1';
        return fx;
      })
      .routePatientActions()
      .routeAction()
      .routeActionActivity()
      .routePatientFlows()
      .routePatientByAction()
      .routePrograms()
      .routeAllProgramActions()
      .routeAllProgramFlows()
      .visit('/worklist/owned-by');

    cy.clock(testTime, ['Date']);

    cy
      .get('[data-toggle-region]')
      .contains('Actions')
      .click()
      .wait('@routeActions');

    cy
      .get('.worklist-list__filter-region')
      .as('filterRegion')
      .find('.js-bulk-edit')
      .should('contain', 'Edit 1 Action');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .as('firstRow')
      .should('contain', 'First In List')
      .should('contain', 'Test Flow')
      .should('have.class', 'is-selected')
      .next()
      .should('contain', 'Second In List')
      .next()
      .should('contain', 'Last In List');

    cy
      .get('@firstRow')
      .find('.js-select')
      .find('.fa-check-square')
      .click();

    cy
      .get('@firstRow')
      .should('not.have.class', 'is-selected')
      .find('.js-select')
      .find('.fa-square');

    cy
      .get('.worklist-list__toggle')
      .find('.worklist-list__toggle-actions')
      .should('contain', 'Actions')
      .should('have.class', 'button--blue')
      .next()
      .should('not.have.class', 'button--blue')
      .should('contain', 'Flows');

    cy
      .get('.list-page__header')
      .find('.table-list__header')
      .eq(2)
      .should('contain', 'Action')
      .next()
      .should('contain', 'State, Owner, Due, Form')
      .next()
      .should('contain', 'Added')
      .next()
      .should('contain', 'Updated');

    cy
      .routeFlow()
      .routeFlowActions();

    cy
      .get('@firstRow')
      .click('top')
      .wait('@routeFlow')
      .wait('@routeFlowActions');

    cy
      .url()
      .should('contain', 'flow/1/action/1');

    cy
      .go('back')
      .wait('@routeActions');

    cy
      .get('@firstRow')
      .next()
      .as('secondRow')
      .click('top');

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
      .wait('@routeActions');

    cy
      .get('@firstRow')
      .contains('Test Patient')
      .click();

    cy
      .url()
      .should('contain', 'patient/dashboard/1')
      .wait('@routePatient')
      .wait('@routePatientActions');

    cy
      .go('back')
      .wait('@routeActions');

    cy
      .get('@firstRow')
      .contains('Test Flow')
      .click();

    cy
      .url()
      .should('contain', 'flow/1/action/1')
      .wait('@routeFlowActions');

    cy
      .go('back')
      .wait('@routeActions');

    cy
      .get('@secondRow')
      .next()
      .click('top');

    cy
      .url()
      .wait('@routePatientActions');

    cy
      .get('.patient__layout')
      .find('.patient__tab--selected')
      .contains('Data & Events');

    cy
      .go('back')
      .wait('@routeActions');

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
      .find('.fa-exclamation-circle')
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
      .find('.picklist__group')
      .first()
      .should('contain', 'Clinician McTester')
      .next()
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
      .find('[data-due-date-region]')
      .click();

    cy
      .get('.datepicker')
      .find('.datepicker__header .js-prev')
      .click();

    cy
      .get('.datepicker')
      .find('li:not(.is-other-month)')
      .first()
      .click();

    cy
      .get('@firstRow')
      .find('[data-due-date-region] .is-overdue');

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.due_date).to.equal(dayjs(testDateSubtract(1, 'month')).date(1).format('YYYY-MM-DD'));
      });

    cy
      .get('@firstRow')
      .find('[data-due-date-region]')
      .click();

    cy
      .get('.datepicker')
      .contains('Today')
      .click();

    cy
      .get('@firstRow')
      .find('[data-due-date-region]')
      .should('contain', formatDate(testDate(), 'SHORT'));

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.due_date).to.equal(testDate());
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
      .find('[data-due-time-region]')
      .find('.is-overdue');

    cy
      .get('@firstRow')
      .find('[data-due-date-region]')
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
      .find('.fa-check-circle')
      .should('not.be.disabled');

    cy
      .get('@secondRow')
      .next()
      .find('[data-owner-region] button')
      .should('be.disabled');

    cy
      .get('@secondRow')
      .next()
      .find('[data-due-date-region] button')
      .should('be.disabled');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .last()
      .find('[data-form-region]')
      .should('be.empty');

    cy
      .get('@secondRow')
      .find('[data-form-region] button')
      .click();

    cy
      .url()
      .should('contain', 'patient-action/2/form/1');

    cy
      .go('back');

    cy.clock().invoke('restore');
  });

  specify('non-existent worklist', function() {
    cy
      .visit('/worklist/test')
      .url()
      .should('contain', '404');
  });

  specify('clinician filtering', function() {
    cy
      .server()
      .routeGroupsBootstrap(
        fx => {
          _.each(fx.data, group => {
            group.relationships.clinicians.data = [
              {
                id: 'test-clinician',
                type: 'clinicians',
              },
              {
                id: '1',
                type: 'clinicians',
              },
              {
                id: '2',
                type: 'clinicians',
              },
              {
                id: '3',
                type: 'clinicians',
              },
            ];
          });

          return fx;
        },
        testGroups,
        fx => {
          fx.data[0].id = 'test-clinician';
          fx.data[0].attributes.name = 'Test Clinician';
          fx.data[1].id = '1';
          fx.data[1].attributes.name = 'C Clinician';
          fx.data[2].id = '2';
          fx.data[2].attributes.name = 'A Clinician';
          fx.data[3].id = '3';
          fx.data[3].attributes.name = 'B Clinician';

          return fx;
        })
      .routeFlows()
      .routeFlow()
      .routeFlowActions()
      .routeActions()
      .visit('/worklist/owned-by')
      .wait('@routeFlows')
      .its('url')
      .should('contain', 'filter[group]=1,2,3')
      .should('contain', 'filter[clinician]=11111')
      .should('contain', 'filter[status]=queued,started');

    cy
      .get('[data-owner-filter-region]')
      .should('contain', 'Clinician McTester')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__group')
      .contains('Group One')
      .parent()
      .find('.picklist__item')
      .first()
      .should('contain', 'A Clinician')
      .next()
      .should('contain', 'B Clinician')
      .next()
      .should('contain', 'C Clinician')
      .next()
      .should('contain', 'Test Clinician')
      .click();

    cy
      .wait('@routeFlows')
      .its('url')
      .should('contain', 'filter[group]=1,2,3')
      .should('contain', 'filter[clinician]=test-clinician')
      .should('contain', 'filter[status]=queued,started');

    cy
      .get('.list-page__title')
      .should('contain', 'Test Clinician');

    cy
      .get('[data-owner-filter-region]')
      .should('contain', 'Test Clinician')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .first()
      .should('contain', 'Clinician McTester')
      .click();

    cy
      .wait('@routeFlows')
      .its('url')
      .should('contain', 'filter[group]=1,2,3')
      .should('contain', 'filter[clinician]=11111')
      .should('contain', 'filter[status]=queued,started');

    cy
      .get('.list-page__title')
      .should('contain', 'Clinician McTester');

    cy
      .get('.worklist-list__toggle')
      .contains('Actions')
      .click()
      .wait('@routeActions');

    cy
      .get('[data-owner-filter-region]')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains('Test Clinician')
      .click();

    cy
      .get('@routeActions')
      .its('url')
      .should('contain', 'filter[clinician]=test-clinician');
  });

  specify('group filtering', function() {
    cy
      .server()
      .routeGroupsBootstrap(_.identity, testGroups)
      .routeFlows()
      .routeFlow()
      .routeFlowActions()
      .visit('/worklist/owned-by')
      .wait('@routeFlows')
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
      .wait('@routeFlows')
      .its('url')
      .should('contain', 'filter[group]=2')
      .should('contain', 'filter[clinician]=11111')
      .should('contain', 'filter[status]=queued,started');

    cy
      .get('.list-page__filters')
      .contains('Another Group');

    cy
      .get('.list-page__list')
      .find('.table-list__item')
      .first()
      .click('top')
      .wait('@routeFlow')
      .wait('@routeFlowActions');

    cy
      .get('.patient-flow__context-trail')
      .contains('Back to List')
      .click()
      .wait('@routeFlows');

    cy
      .get('.list-page__filters')
      .contains('Another Group');
  });

  specify('group filtering - new flows', function() {
    cy
      .server()
      .routeGroupsBootstrap(_.identity, testGroups)
      .routeFlows()
      .visit('/worklist/new-past-day')
      .wait('@routeFlows')
      .its('url')
      .should('contain', 'filter[group]=1,2,3')
      .should('contain', 'filter[created_at]=')
      .should('contain', 'filter[status]=queued,started');

    cy
      .get('.list-page__filters')
      .find('[data-date-filter-region]')
      .should('be.empty');
    cy
      .get('.list-page__filters')
      .contains('All Groups')
      .click();

    cy
      .get('.picklist__item')
      .contains('Another Group')
      .click()
      .wait('@routeFlows')
      .its('url')
      .should('contain', 'filter[group]=2')
      .should('contain', 'filter[created_at]=')
      .should('contain', 'filter[status]=queued,started');
  });

  specify('owner filtering', function() {
    cy
      .server()
      .routeGroupsBootstrap(
        fx => {
          _.each(fx.data, group => {
            group.relationships.clinicians.data = [
              {
                id: 'test-clinician',
                type: 'clinicians',
              },
              {
                id: '1',
                type: 'clinicians',
              },
              {
                id: '2',
                type: 'clinicians',
              },
              {
                id: '3',
                type: 'clinicians',
              },
            ];
          });

          return fx;
        },
        testGroups,
        fx => {
          fx.data[0].id = 'test-clinician';
          fx.data[0].attributes.name = 'Test Clinician';
          fx.data[1].id = '1';
          fx.data[1].attributes.name = 'C Clinician';
          fx.data[2].id = '2';
          fx.data[2].attributes.name = 'A Clinician';
          fx.data[3].id = '3';
          fx.data[3].attributes.name = 'B Clinician';

          return fx;
        })
      .routeFlows()
      .routeFlow()
      .routeFlowActions()
      .routeActions()
      .visit('/worklist/new-past-day')
      .wait('@routeFlows');

    cy
      .get('[data-owner-filter-region]')
      .find('button')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains('Pharmacist')
      .click();

    cy
      .get('@routeFlows')
      .its('url')
      .should('contain', 'filter[role]=33333');

    cy
      .get('[data-owner-filter-region]')
      .find('button')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains('C Clinician')
      .click();

    cy
      .get('@routeFlows')
      .its('url')
      .should('contain', 'filter[clinician]=1');
  });

  specify('date filtering', function() {
    const testTime = dayjs().hour(10).utc().valueOf();
    const filterDate = testDateSubtract(1);

    localStorage.setItem('owned-by_11111', JSON.stringify({
      actionsSortId: 'sortUpdateDesc',
      flowsSortId: 'sortUpdateDesc',
      filters: {
        type: 'flows',
        groupId: null,
        clinicianId: '11111',
      },
      actionsDateFilters: {
        selectedDate: filterDate,
        dateType: 'created_at',
      },
      selectedActions: {
        '1': true,
      },
      selectedFlows: {},
    }));

    cy.clock(testTime, ['Date']);

    cy
      .server()
      .routeGroupsBootstrap(_.identity, testGroups)
      .routeFlows()
      .routeActions()
      .routeFlow()
      .routeFlowActions()
      .visit('/worklist/owned-by')
      .wait('@routeFlows')
      .its('url')
      .should('contain', `filter[created_at]=${ dayjs(testTs()).startOf('month').format() },${ dayjs(testTs()).endOf('month').format() }`);

    cy
      .get('[data-date-filter-region]')
      .should('contain', 'Added:')
      .should('contain', 'This Month')
      .click();

    cy
      .get('.datepicker')
      .should('not.contain', 'Due');

    cy
      .get('.worklist-list__toggle')
      .find('.js-toggle-actions')
      .click()
      .wait('@routeActions');

    cy
      .get('[data-date-filter-region]')
      .should('contain', 'Added:')
      .should('contain', formatDate(filterDate, 'MM/DD/YYYY'))
      .find('.js-prev')
      .trigger('mouseover');

    cy
      .get('.tooltip')
      .should('contain', formatDate(testDateSubtract(2), 'MM/DD/YYYY'));

    cy
      .get('[data-date-filter-region]')
      .find('.js-prev')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem('owned-by_11111'));

        expect(formatDate(storage.actionsDateFilters.selectedDate, 'YYYY-MM-DD')).to.be.equal(testDateSubtract(2));
        expect(storage.actionsDateFilters.relativeDate).to.be.null;
        expect(storage.actionsDateFilters.selectedMonth).to.be.null;
      })
      .wait('@routeActions');

    cy
      .get('[data-date-filter-region]')
      .should('contain', formatDate(testDateSubtract(2), 'MM/DD/YYYY'))
      .find('.js-next')
      .trigger('mouseover');

    cy
      .get('.tooltip')
      .should('contain', formatDate(filterDate, 'MM/DD/YYYY'));

    cy
      .get('[data-date-filter-region]')
      .find('.js-next')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem('owned-by_11111'));

        expect(formatDate(storage.actionsDateFilters.selectedDate, 'YYYY-MM-DD')).to.be.equal(filterDate);
        expect(storage.actionsDateFilters.relativeDate).to.be.null;
        expect(storage.actionsDateFilters.selectedMonth).to.be.null;
      })
      .wait('@routeActions');

    cy
      .get('[data-date-filter-region]')
      .should('contain', formatDate(filterDate, 'MM/DD/YYYY'))
      .click();

    cy
      .get('.datepicker')
      .contains('Updated')
      .click();

    cy
      .get('.datepicker')
      .find('.js-current-month')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem('owned-by_11111'));

        expect(storage.actionsDateFilters.relativeDate).to.be.null;
        expect(storage.actionsDateFilters.selectedDate).to.be.null;
        expect(storage.actionsDateFilters.selectedMonth).to.be.null;
        expect(storage.actionsDateFilters.dateType).to.be.equal('updated_at');
      });

    cy
      .wait('@routeActions')
      .its('url')
      .should('contain', `filter[updated_at]=${ dayjs(testTs()).startOf('month').format() },${ dayjs(testTs()).endOf('month').format() }`);

    cy
      .get('[data-date-filter-region]')
      .should('contain', 'Updated:')
      .should('contain', 'This Month')
      .find('.js-prev')
      .trigger('mouseover');

    cy
      .get('.tooltip')
      .should('contain', formatDate(testDateSubtract(1, 'month'), 'MMM YYYY'));

    cy
      .get('[data-date-filter-region]')
      .find('.js-prev')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem('owned-by_11111'));

        expect(formatDate(storage.actionsDateFilters.selectedMonth, 'MMM YYYY')).to.equal(formatDate(testDateSubtract(1, 'month'), 'MMM YYYY'));
        expect(storage.actionsDateFilters.relativeDate).to.be.null;
        expect(storage.actionsDateFilters.selectedDate).to.be.null;
      });

    const lastMonth = testTsSubtract(1, 'month');
    cy
      .wait('@routeActions')
      .its('url')
      .should('contain', `filter[updated_at]=${ dayjs(lastMonth).startOf('month').format() },${ dayjs(lastMonth).endOf('month').format() }`);

    cy
      .get('[data-date-filter-region]')
      .should('contain', formatDate(lastMonth, 'MMM YYYY'))
      .click();

    cy
      .get('.datepicker')
      .find('.js-current-month')
      .click()
      .wait('@routeActions');

    cy
      .get('[data-date-filter-region]')
      .should('contain', 'This Month')
      .find('.js-next')
      .trigger('mouseover');

    cy
      .get('.tooltip')
      .should('contain', formatDate(testDateAdd(1, 'month'), 'MMM YYYY'));

    cy
      .get('[data-date-filter-region]')
      .find('.js-next')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem('owned-by_11111'));

        expect(formatDate(storage.actionsDateFilters.selectedMonth, 'MMM YYYY')).to.equal(formatDate(testDateAdd(1, 'month'), 'MMM YYYY'));
        expect(storage.actionsDateFilters.relativeDate).to.be.null;
        expect(storage.actionsDateFilters.selectedDate).to.be.null;
      })
      .wait('@routeActions');

    cy
      .get('[data-date-filter-region]')
      .should('contain', formatDate(testDateAdd(1, 'month'), 'MMM YYYY'))
      .click();

    cy
      .get('.datepicker')
      .contains('Due')
      .click();

    cy
      .get('.datepicker')
      .find('.js-today')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem('owned-by_11111'));

        expect(storage.actionsDateFilters.relativeDate).to.equal('today');
        expect(storage.actionsDateFilters.selectedDate).to.be.null;
        expect(storage.actionsDateFilters.selectedMonth).to.be.null;
        expect(storage.actionsDateFilters.dateType).to.equal('due_date');
      });

    cy
      .wait('@routeActions')
      .its('url')
      .should('contain', `filter[due_date]=${ testDate() },${ testDate() }`);

    cy
      .get('[data-date-filter-region]')
      .should('contain', 'Due:')
      .should('contain', 'Today')
      .find('.js-prev')
      .trigger('mouseover');

    cy
      .get('.tooltip')
      .should('contain', formatDate(testDateSubtract(1), 'MM/DD/YYYY'));

    cy
      .get('[data-date-filter-region]')
      .find('.js-prev')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem('owned-by_11111'));

        expect(formatDate(storage.actionsDateFilters.selectedDate, 'YYYY-MM-DD')).to.equal(testDateSubtract(1));
        expect(storage.actionsDateFilters.relativeDate).to.be.null;
        expect(storage.actionsDateFilters.selectedMonth).to.be.null;
      })
      .wait('@routeActions');

    cy
      .get('[data-date-filter-region]')
      .should('contain', formatDate(testDateSubtract(1), 'MM/DD/YYYY'))
      .click();

    cy
      .get('.datepicker')
      .contains('Added')
      .click();

    cy
      .get('.datepicker')
      .find('.js-today')
      .click()
      .wait('@routeActions');

    cy
      .get('[data-date-filter-region]')
      .should('contain', 'Added:')
      .should('contain', 'Today')
      .find('.js-next')
      .trigger('mouseover');

    cy
      .get('.tooltip')
      .should('contain', formatDate(testDateAdd(1), 'MM/DD/YYYY'));

    cy
      .get('[data-date-filter-region]')
      .find('.js-next')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem('owned-by_11111'));

        expect(formatDate(storage.actionsDateFilters.selectedDate, 'YYYY-MM-DD')).to.equal(formatDate(testDateAdd(1), 'YYYY-MM-DD'));
        expect(storage.actionsDateFilters.relativeDate).to.be.null;
        expect(storage.actionsDateFilters.selectedMonth).to.be.null;
        expect(storage.actionsDateFilters.dateType).to.equal('created_at');
      });

    cy
      .wait('@routeActions')
      .its('url')
      .should('contain', `filter[created_at]=${ dayjs(testTsAdd(1)).startOf('day').format() },${ dayjs(testTsAdd(1)).endOf('day').format() }`);

    cy
      .get('[data-date-filter-region]')
      .should('contain', formatDate(testDateAdd(1), 'MM/DD/YYYY'))
      .click();

    cy
      .get('.datepicker')
      .find('.js-yesterday')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem('owned-by_11111'));

        expect(storage.actionsDateFilters.relativeDate).to.equal('yesterday');
        expect(storage.actionsDateFilters.selectedDate).to.be.null;
        expect(storage.actionsDateFilters.selectedMonth).to.be.null;
      });

    cy
      .wait('@routeActions')
      .its('url')
      .should('contain', `filter[created_at]=${ dayjs(testTsSubtract(1)).startOf('day').format() },${ dayjs(testTsSubtract(1)).endOf('day').format() }`);

    cy
      .get('[data-date-filter-region]')
      .should('contain', 'Yesterday')
      .find('.js-prev')
      .trigger('mouseover');

    cy
      .get('.tooltip')
      .should('contain', formatDate(testDateSubtract(2), 'MM/DD/YYYY'));

    cy
      .get('[data-date-filter-region]')
      .find('.js-prev')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem('owned-by_11111'));

        expect(formatDate(storage.actionsDateFilters.selectedDate, 'YYYY-MM-DD')).to.equal(testDateSubtract(2));
        expect(storage.actionsDateFilters.relativeDate).to.be.null;
        expect(storage.actionsDateFilters.selectedMonth).to.be.null;
      })
      .wait('@routeActions');

    cy
      .get('[data-date-filter-region]')
      .should('contain', formatDate(testDateSubtract(2), 'MM/DD/YYYY'))
      .click();

    cy
      .get('.datepicker')
      .find('.js-yesterday')
      .click()
      .wait('@routeActions');

    cy
      .get('[data-date-filter-region]')
      .should('contain', 'Yesterday')
      .find('.js-next')
      .trigger('mouseover');

    cy
      .get('.tooltip')
      .should('contain', formatDate(testDate(), 'MM/DD/YYYY'));

    cy
      .get('[data-date-filter-region]')
      .find('.js-next')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem('owned-by_11111'));

        expect(formatDate(storage.actionsDateFilters.selectedDate, 'YYYY-MM-DD')).to.equal(testDate());
        expect(storage.actionsDateFilters.relativeDate).to.be.null;
        expect(storage.actionsDateFilters.selectedMonth).to.be.null;
      })
      .wait('@routeActions');

    cy
      .get('[data-date-filter-region]')
      .should('contain', formatDate(testDate(), 'MM/DD/YYYY'))
      .click();

    cy
      .get('.datepicker')
      .find('.js-month')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem('owned-by_11111'));

        expect(storage.actionsDateFilters.relativeDate).to.be.null;
        expect(storage.actionsDateFilters.selectedDate).to.be.null;
        expect(formatDate(storage.actionsDateFilters.selectedMonth, 'MMM YYYY')).to.equal(formatDate(testDate(), 'MMM YYYY'));
      });

    cy
      .wait('@routeActions')
      .its('url')
      .should('contain', `filter[created_at]=${ dayjs(testTs()).startOf('month').format() },${ dayjs(testTs()).endOf('month').format() }`);

    cy
      .get('[data-date-filter-region]')
      .find('.js-prev')
      .trigger('mouseover');

    cy
      .get('.tooltip')
      .should('contain', formatDate(testDateSubtract(1, 'month'), 'MMM YYYY'));

    cy
      .get('[data-date-filter-region]')
      .find('.js-prev')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem('owned-by_11111'));

        expect(storage.actionsDateFilters.relativeDate).to.be.null;
        expect(storage.actionsDateFilters.selectedDate).to.be.null;
        expect(formatDate(storage.actionsDateFilters.selectedMonth, 'MMM YYYY')).to.equal(formatDate(testDateSubtract(1, 'month'), 'MMM YYYY'));
      })
      .wait('@routeActions');

    cy
      .get('[data-date-filter-region]')
      .should('contain', formatDate(testDateSubtract(1, 'month'), 'MMM YYYY'))
      .find('.js-next')
      .trigger('mouseover');

    cy
      .get('.tooltip')
      .should('contain', formatDate(testDate(), 'MMM YYYY'));

    cy
      .get('[data-date-filter-region]')
      .find('.js-next')
      .click();

    cy
      .get('[data-date-filter-region]')
      .should('contain', formatDate(testDate(), 'MMM YYYY'))
      .find('.js-next')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem('owned-by_11111'));

        expect(storage.actionsDateFilters.relativeDate).to.be.null;
        expect(storage.actionsDateFilters.selectedDate).to.be.null;
        expect(formatDate(storage.actionsDateFilters.selectedMonth, 'MMM YYYY')).to.equal(formatDate(testDateAdd(1, 'month'), 'MMM YYYY'));
      })
      .wait('@routeActions');

    cy
      .get('[data-date-filter-region]')
      .should('contain', formatDate(testDateAdd(1, 'month'), 'MMM YYYY'))
      .click();

    cy
      .get('.datepicker')
      .find('.js-prev')
      .click();

    cy
      .get('.datepicker')
      .contains('Updated')
      .click();

    cy
      .get('.datepicker')
      .contains('Updated')
      .should('have.class', 'is-active');

    cy
      .get('.datepicker')
      .contains('Due')
      .click();

    cy
      .get('.datepicker')
      .contains('Due')
      .should('have.class', 'is-active');

    cy
      .get('.datepicker')
      .contains('Added')
      .click();

    cy
      .get('.datepicker')
      .contains('Added')
      .should('have.class', 'is-active');

    cy
      .get('.datepicker')
      .find('.is-today')
      .click();

    cy
      .get('.datepicker')
      .should('not.exist');

    cy
      .get('[data-date-filter-region]')
      .should('contain', 'Added:')
      .should('contain', formatDate(testDate(), 'MM/DD/YYYY'));

    cy.clock().invoke('restore');
  });

  specify('clinician in only one group', function() {
    cy
      .server()
      .routeGroupsBootstrap(_.identity, [testGroups[0]])
      .routeFlows()
      .routeActions()
      .visit('/worklist/shared-by')
      .wait('@routeFlows')
      .its('url')
      .should('contain', 'filter[group]=1');

    cy
      .get('.list-page__title')
      .should('contain', 'Shared By Nurse Role');

    cy
      .get('[data-date-filter-region]')
      .should('not.be.empty');

    cy
      .get('[data-group-filter-region]')
      .should('be.empty');

    cy
      .get('[data-owner-filter-region]')
      .find('button')
      .should('contain', 'Nurse')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains('Pharmacist')
      .click();

    cy
      .get('.list-page__title')
      .should('contain', 'Shared By Pharmacist Role');

    cy
      .get('@routeFlows')
      .its('url')
      .should('contain', 'filter[role]=33333');

    cy
      .get('.worklist-list__toggle')
      .find('.worklist-list__toggle-actions')
      .click()
      .wait('@routeActions');

    cy
      .get('.list-page__title')
      .should('contain', 'Shared By Pharmacist Role');
  });

  specify('flow sorting', function() {
    cy
      .server()
      .routeFlows(fx => {
        fx.data = _.sample(fx.data, 4);

        fx.data[0].relationships.state = { data: { id: '33333' } };
        fx.data[0].attributes.name = 'Updated Most Recent';
        fx.data[0].attributes.updated_at = testTsSubtract(1);
        fx.data[0].attributes.created_at = testTsSubtract(2);

        fx.data[1].relationships.state = { data: { id: '33333' } };
        fx.data[1].attributes.name = 'Updated Least Recent';
        fx.data[1].attributes.updated_at = testTsSubtract(10);
        fx.data[1].attributes.created_at = testTsSubtract(2);

        fx.data[2].relationships.state = { data: { id: '33333' } };
        fx.data[2].attributes.name = 'Created Most Recent';
        fx.data[2].attributes.updated_at = testTsSubtract(2);
        fx.data[2].attributes.created_at = testTsSubtract(1);

        fx.data[3].relationships.state = { data: { id: '33333' } };
        fx.data[3].attributes.name = 'Created Least Recent';
        fx.data[3].attributes.updated_at = testTsSubtract(2);
        fx.data[3].attributes.created_at = testTsSubtract(10);

        return fx;
      })
      .visit('/worklist/shared-by')
      .wait('@routeFlows');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .should('contain', 'Created Most Recent');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .last()
      .should('contain', 'Created Least Recent');

    cy
      .get('.worklist-list__filter-sort')
      .click()
      .get('.picklist')
      .contains('Added: Oldest - Newest')
      .click();

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .should('contain', 'Created Least Recent');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .last()
      .should('contain', 'Created Most Recent');

    cy
      .get('.worklist-list__filter-sort')
      .click()
      .get('.picklist')
      .contains('Updated: Oldest - Newest')
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
      .get('.worklist-list__filter-sort')
      .click()
      .get('.picklist')
      .contains('Updated: Newest - Oldest')
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
      .get('.worklist-list__filter-sort')
      .click()
      .get('.picklist')
      .should('not.contain', 'Due');
  });

  specify('action sorting', function() {
    cy
      .server()
      .routeActions(fx => {
        fx.data = _.sample(fx.data, 8);

        fx.data[0].relationships.state = { data: { id: '33333' } };
        fx.data[0].attributes.name = 'Updated Most Recent';
        fx.data[0].attributes.due_date = testDateAdd(3);
        fx.data[0].attributes.due_time = null;
        fx.data[0].attributes.updated_at = testTsSubtract(1);
        fx.data[0].attributes.created_at = testTsSubtract(8);

        fx.data[1].relationships.state = { data: { id: '33333' } };
        fx.data[1].attributes.name = 'Updated Least Recent';
        fx.data[1].attributes.due_date = testDateAdd(3);
        fx.data[1].attributes.due_time = null;
        fx.data[1].attributes.updated_at = testTsSubtract(10);
        fx.data[1].attributes.created_at = testTsSubtract(8);

        fx.data[2].relationships.state = { data: { id: '33333' } };
        fx.data[2].attributes.name = 'Due Date Least Recent';
        fx.data[2].attributes.due_date = testDateAdd(1);
        fx.data[2].attributes.due_time = null;
        fx.data[2].attributes.updated_at = testTsSubtract(3);
        fx.data[2].attributes.created_at = testTsSubtract(8);

        fx.data[3].relationships.state = { data: { id: '33333' } };
        fx.data[3].attributes.name = 'Due Date Most Recent';
        fx.data[3].attributes.due_date = testDateAdd(10);
        fx.data[3].attributes.due_time = null;
        fx.data[3].attributes.updated_at = testTsSubtract(3);
        fx.data[3].attributes.created_at = testTsSubtract(8);

        fx.data[4].relationships.state = { data: { id: '33333' } };
        fx.data[4].attributes.name = 'Due Time Most Recent';
        fx.data[4].attributes.due_date = testDateAdd(2);
        fx.data[4].attributes.due_time = '11:00:00';
        fx.data[4].attributes.updated_at = testTsSubtract(3);
        fx.data[4].attributes.created_at = testTsSubtract(8);

        fx.data[5].relationships.state = { data: { id: '33333' } };
        fx.data[5].attributes.name = 'Due Time Least Recent';
        fx.data[5].attributes.due_date = testDateAdd(2);
        fx.data[5].attributes.due_time = '12:15:00';
        fx.data[5].attributes.updated_at = testTsSubtract(3);
        fx.data[5].attributes.created_at = testTsSubtract(8);

        fx.data[6].relationships.state = { data: { id: '33333' } };
        fx.data[6].attributes.name = 'Created Most Recent';
        fx.data[6].attributes.due_date = testDateAdd(3);
        fx.data[6].attributes.due_time = null;
        fx.data[6].attributes.updated_at = testTsSubtract(2);
        fx.data[6].attributes.created_at = testTsSubtract(1);

        fx.data[7].relationships.state = { data: { id: '33333' } };
        fx.data[7].attributes.name = 'Created Least Recent';
        fx.data[7].attributes.due_date = testDateAdd(3);
        fx.data[7].attributes.due_time = null;
        fx.data[7].attributes.updated_at = testTsSubtract(2);
        fx.data[7].attributes.created_at = testTsSubtract(10);

        return fx;
      }, '1')
      .routePatient()
      .routePatientActions()
      .routeAction()
      .routeActionActivity()
      .routePatientFlows()
      .visit('/worklist/shared-by');

    cy
      .get('[data-toggle-region]')
      .contains('Actions')
      .click()
      .wait('@routeActions');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .should('contain', 'Created Most Recent');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .last()
      .should('contain', 'Created Least Recent');

    cy
      .get('.worklist-list__filter-sort')
      .click()
      .get('.picklist')
      .contains('Updated: Oldest - Newest')
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
      .get('.worklist-list__filter-sort')
      .click()
      .get('.picklist')
      .contains('Updated: Newest - Oldest')
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
      .get('.worklist-list__filter-sort')
      .click()
      .get('.picklist')
      .contains('Added: Oldest - Newest')
      .click();

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .should('contain', 'Created Least Recent');

    cy
      .get('.worklist-list__filter-sort')
      .click()
      .get('.picklist')
      .contains('Added: Newest - Oldest')
      .click();

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .should('contain', 'Created Most Recent');

    cy
      .get('.worklist-list__filter-sort')
      .click()
      .get('.picklist')
      .contains('Due: Oldest - Newest')
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
      .get('.worklist-list__filter-sort')
      .click()
      .get('.picklist')
      .contains('Due: Newest - Oldest')
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
      .contains('Due Date Most Recent')
      .click()
      .wait('@routeAction')
      .wait('@routeActionActivity')
      .wait('@routePatientFlows')
      .wait('@routePatient');

    cy
      .get('.patient__context-trail')
      .contains('Back to List')
      .click()
      .wait('@routeActions');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .contains('Due Date Most Recent');

    cy
      .get('.worklist-list__filter-sort')
      .contains('Due: Newest - Oldest');
  });

  specify('find in list', function() {
    cy
      .server()
      .routeGroupsBootstrap(_.identity, testGroups)
      .routeFlows(fx => {
        fx.data[0].attributes.name = 'Test Flow';
        fx.data[0].attributes.created_at = testTsSubtract(1, 'month');
        fx.data[0].attributes.updated_at = testTsSubtract(20);
        fx.data[0].relationships.patient.data.id = '1';
        fx.data[0].relationships.owner.data = {
          id: '55555',
          type: 'clinicians',
        };

        fx.data[1].attributes.name = 'Flow - Specialist';
        fx.data[1].attributes.created_at = testTsSubtract(1, 'month');
        fx.data[1].attributes.updated_at = testTsSubtract(19);
        fx.data[1].relationships.patient.data.id = '1';
        fx.data[1].relationships.owner.data = {
          id: '55555',
          type: 'roles',
        };

        fx.data[2].attributes.name = 'Flow - Role/State Search';
        fx.data[2].attributes.created_at = testTsSubtract(1, 'month');
        fx.data[2].attributes.updated_at = testTsSubtract(19);
        fx.data[2].relationships.patient.data.id = '1';
        fx.data[2].relationships.owner.data = {
          id: '22222',
          type: 'roles',
        };
        fx.data[2].relationships.state.data = {
          id: '33333',
          type: 'states',
        };

        fx.included.push({
          type: 'patients',
          id: '1',
          attributes: {
            first_name: 'Test',
            last_name: 'Patient',
          },
        },
        {
          id: '55555',
          type: 'clinicians',
          attributes: {
            access: 'employee',
            name: 'Test Clinician',
          },
        });
        return fx;
      })
      .routePatient(fx => {
        fx.data.id = '1';
        return fx;
      })
      .routePatientActions()
      .routeAction()
      .routeActionActivity()
      .routePatientFlows()
      .routePatientByAction()
      .routePrograms()
      .routeAllProgramActions()
      .routeAllProgramFlows()
      .visit('/worklist/owned-by');

    cy
      .get('.list-page__header')
      .find('[data-search-region] .js-input:disabled')
      .should('have.attr', 'placeholder', 'Find in List...');

    cy
      .wait('@routeFlows');

    cy
      .get('.list-page__header')
      .find('[data-search-region] .js-input:not([disabled])')
      .as('listSearch')
      .focus()
      .type('abcd')
      .next()
      .should('have.class', 'js-clear');

    cy
      .get('.list-page__list')
      .as('flowList')
      .find('.table-empty-list')
      .should('contain', 'No results match your Find in List search');

    cy
      .get('@listSearch')
      .next()
      .click();

    cy
      .get('@flowList')
      .find('.work-list__item')
      .should('have.length', 10);

    cy
      .get('@listSearch')
      .type('Test');

    cy
      .get('@flowList')
      .find('.work-list__item')
      .should('have.length', 3);

    cy
      .get('@listSearch')
      .next()
      .click();

    cy
      .get('@listSearch')
      .type(formatDate(testTsSubtract(1, 'month'), 'MMM D'));

    cy
      .get('@flowList')
      .find('.work-list__item')
      .should('have.length', 3);

    cy
      .get('[data-select-all-region]')
      .find('button')
      .click();

    cy
      .get('@flowList')
      .find('.work-list__item .fa-check-square')
      .should('have.length', 3);

    cy
      .get('[data-select-all-region]')
      .find('.fa-check-square');

    cy
      .get('[data-filters-region]')
      .find('.js-bulk-edit')
      .should('contain', 'Edit 3 Flows');

    cy
      .get('@listSearch')
      .next()
      .click();

    cy
      .get('[data-select-all-region]')
      .find('.fa-minus-square');

    cy
      .get('[data-filters-region]')
      .find('.js-bulk-edit')
      .should('contain', 'Edit 3 Flows');

    cy
      .get('[data-select-all-region]')
      .find('button')
      .click();

    cy
      .get('@flowList')
      .find('.work-list__item .fa-check-square')
      .should('have.length', 10)
      .first()
      .click();

    cy
      .get('[data-select-all-region]')
      .find('.fa-minus-square');

    cy
      .get('@listSearch')
      .type(formatDate(testTsSubtract(1, 'month'), 'MMM D'));

    cy
      .get('[data-select-all-region]')
      .find('.fa-check-square');

    cy
      .get('[data-filters-region]')
      .find('.js-bulk-edit')
      .should('contain', 'Edit 3 Flows');

    cy
      .get('@listSearch')
      .next()
      .click()
      .should('not.be.visible');

    cy
      .get('@listSearch')
      .type('Clinician');

    cy
      .get('@flowList')
      .find('.work-list__item')
      .should('have.length', 1)
      .first()
      .should('contain', 'Test Flow');

    cy
      .get('@listSearch')
      .next()
      .click();

    cy
      .get('@listSearch')
      .type('Flow Specialist');

    cy
      .get('@flowList')
      .find('.work-list__item')
      .should('have.length', 1)
      .first()
      .should('contain', 'Flow - Specialist');

    cy
      .get('@listSearch')
      .next()
      .click();

    cy
      .get('@listSearch')
      .type('In Progress');

    cy
      .get('@flowList')
      .find('.work-list__item')
      .contains('Flow - Role/State Search');

    cy
      .get('@listSearch')
      .next()
      .click();

    cy
      .get('@listSearch')
      .type('Nurse');

    cy
      .get('@flowList')
      .find('.work-list__item')
      .contains('Flow - Role/State Search');
  });

  specify('empty flows view', function() {
    cy
      .server()
      .routeFlows(fx => {
        fx.data = [];

        return fx;
      })
      .visit('/worklist/owned-by')
      .wait('@routeFlows');

    cy
      .get('.table-empty-list')
      .contains('No Flows');

    cy
      .get('.list-page__header')
      .find('[data-search-region] .js-input')
      .should('be.disabled');
  });

  specify('empty actions view', function() {
    cy
      .server()
      .routeFlows()
      .routeActions(fx => {
        fx.data = [];

        return fx;
      })
      .visit('/worklist/owned-by');

    cy
      .get('[data-toggle-region]')
      .contains('Actions')
      .click()
      .wait('@routeActions');

    cy
      .get('.table-empty-list')
      .contains('No Actions');

    cy
      .get('.list-page__header')
      .find('[data-search-region] .js-input')
      .should('be.disabled');
  });
});
