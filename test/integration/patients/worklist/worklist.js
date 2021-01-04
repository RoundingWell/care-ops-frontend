import _ from 'underscore';
import dayjs from 'dayjs';

import formatDate from 'helpers/format-date';
import { testTs, testTsSubtract } from 'helpers/test-timestamp';
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
      .should('contain', 'State, Owner, Due Date, Form')
      .next()
      .should('contain', 'Created')
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
      .find('.is-today')
      .parent()
      .prev()
      .click();

    cy
      .get('@firstRow')
      .find('[data-due-date-region] .is-overdue');

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.attributes.due_date).to.equal(testDateSubtract(1));
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
      .get('[data-clinician-filter-region]')
      .should('contain', 'Clinician McTester')
      .click();

    cy
      .route({
        url: /\/api\/flows\?filter\[clinician\]=test-clinician/,
        status: 204,
        method: 'GET',
        response: {},
      })
      .as('routeFilterTestClinician');

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
      .wait('@routeFilterTestClinician');

    cy
      .get('.list-page__title')
      .should('contain', 'Test Clinician');

    cy
      .get('[data-clinician-filter-region]')
      .should('contain', 'Test Clinician')
      .click();

    cy
      .route({
        url: /\/api\/flows\?filter\[clinician\]=11111/,
        status: 204,
        method: 'GET',
        response: {},
      })
      .as('routeFilterCurrentClinician');

    cy
      .get('.picklist')
      .find('.picklist__item')
      .first()
      .should('contain', 'Clinician McTester')
      .click();

    cy
      .wait('@routeFilterCurrentClinician');

    cy
      .get('.list-page__title')
      .should('contain', 'Clinician McTester');

    cy
      .get('.worklist-list__toggle')
      .contains('Actions')
      .click()
      .wait('@routeActions');

    cy
      .get('[data-clinician-filter-region]')
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
      .wait('@routeFlows')
      .its('url')
      .should('contain', 'filter[group]=2')
      .should('contain', 'filter[created_since]=')
      .should('contain', 'filter[status]=queued,started');
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
      .get('[data-group-filter-region]')
      .should('be.empty');

    cy
      .get('[data-role-filter-region]')
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
      .contains('Created: Oldest - Newest')
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
      .should('not.contain', 'Due Date');
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
      .contains('Created: Oldest - Newest')
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
      .contains('Created: Newest - Oldest')
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
      .get('.worklist-list__filter-sort')
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
      .contains('Due Date: Newest - Oldest');
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
  });
});
