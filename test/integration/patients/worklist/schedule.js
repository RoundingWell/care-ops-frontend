import _ from 'underscore';
import dayjs from 'dayjs';
import { v5 as uuid } from 'uuid';

import formatDate from 'helpers/format-date';
import { testDate, testDateAdd, testDateSubtract } from 'helpers/test-date';
import { getRelationship } from 'helpers/json-api';

import { getAction, getActions } from 'support/api/actions';
import { getPatient } from 'support/api/patients';
import { getFlow } from 'support/api/flows';
import { stateTodo, stateInProgress, stateDone } from 'support/api/states';
import { getClinician, getCurrentClinician } from 'support/api/clinicians';
import { roleEmployee, roleNoFilterEmployee, roleTeamEmployee } from 'support/api/roles';
import { teamNurse, teamCoordinator } from 'support/api/teams';
import { getWorkspacePatient } from 'support/api/workspace-patients';
import { workspaceOne } from 'support/api/workspaces';

const testPatient1 = getPatient({
  id: '1',
  attributes: {
    first_name: 'Test',
    last_name: 'Patient',
  },
});

const testPatient2 = getPatient({
  id: '2',
  attributes: {
    first_name: 'LongTest',
    last_name: 'PatientName',
  },
});

const testFlow = getFlow({
  id: '1',
  attributes: {
    name: 'Parent Flow',
  },
  relationships: {
    state: getRelationship(stateTodo),
  },
});

const STATE_VERSION = 'v6';

context('schedule page', function() {
  specify('display schedule', function() {
    const testActions = [
      {
        id: '1',
        attributes: {
          name: 'Last Action',
          details: 'Last Action Details',
          due_date: testDate(),
          due_time: null,
        },
        relationships: {
          patient: getRelationship(testPatient1),
          form: getRelationship('11111', 'forms'),
          state: getRelationship(stateTodo),
        },
      },
      {
        id: '2',
        attributes: {
          name: 'Outreach Planning: Review Referral, Medical Chart Review, Targeting Interventions, and other tasks',
          due_date: testDate(),
          due_time: '06:45:00',
        },
        relationships: {
          patient: getRelationship(testPatient2),
          form: getRelationship(),
          flow: getRelationship(testFlow),
          state: getRelationship(stateInProgress),
        },
      },
      {
        attributes: {
          name: 'Second Action',
          details: null,
          due_date: testDate(),
          due_time: '10:31:00',
        },
        relationships: {
          patient: getRelationship(testPatient1),
          form: getRelationship(),
          state: getRelationship(stateInProgress),
        },
      },
      {
        attributes: {
          name: 'Third Action',
          due_date: testDate(),
          due_time: '14:00:00',
        },
        relationships: {
          patient: getRelationship(testPatient1),
          form: getRelationship(),
          flow: getRelationship(testFlow),
          state: getRelationship(stateInProgress),
        },
      },
    ];

    const testTime = dayjs().hour(12).minute(0).valueOf();

    localStorage.setItem(`schedule_11111_${ workspaceOne.id }-${ STATE_VERSION }`, JSON.stringify({
      clinicianId: '11111',
      customFilters: {},
      dateFilters: {
        dateType: 'due_date',
        selectedDate: null,
        selectedMonth: dayjs(testDate()).startOf('month'),
        relativeDate: null,
      },
    }));

    cy
      .routesForPatientAction()
      .routeActions(fx => {
        fx.data = [
          ..._.map(testActions, getAction),
          ..._.times(20 - testActions.length, index => {
            return getAction({
              attributes: { due_date: testDateAdd(index + 1) },
              relationships: {
                patient: getRelationship(index % 2 === 0 ? testPatient1 : testPatient2),
                state: getRelationship(index % 2 === 0 ? stateTodo : stateInProgress),
              },
            });
          }),
        ];

        fx.included.push(testPatient1, testPatient2, testFlow);

        return fx;
      })
      .routeAction(fx => {
        fx.data = getAction(testActions[0]);

        return fx;
      })
      .routePatient(fx => {
        fx.data = testPatient1;

        return fx;
      })
      .routeWorkspacePatient(fx => {
        fx.data = getWorkspacePatient({
          id: uuid(testPatient1.id, workspaceOne.id),
        });

        return fx;
      })
      .routeFlow()
      .routeFlowActions()
      .routePatientByFlow()
      .routeFormByAction()
      .routeFormDefinition()
      .routeLatestFormResponse()
      .visitOnClock('/schedule', { now: testTime, functionNames: ['Date'] })
      .wait('@routeActions');

    cy
      .get('[data-count-region]')
      .should('contain', '20 Actions');

    cy
      .get('[data-date-filter-region]')
      .should('contain', formatDate(testDate(), 'MMM YYYY'));

    cy
      .get('.schedule-list__table')
      .as('scheduleList')
      .find('.schedule-list__list-row')
      .last()
      .find('.schedule-list__date')
      .should('contain', formatDate(testDateAdd(20 - testActions.length), 'D'));

    cy
      .get('@scheduleList')
      .find('.schedule-list__list-row')
      .first()
      .find('.schedule-list__date.is-today')
      .should('contain', formatDate(testDate(), 'D'))
      .next()
      .should('contain', formatDate(testDate(), 'MMM, ddd'));

    cy
      .get('@scheduleList')
      .find('.schedule-list__list-row')
      .eq(1)
      .find('.schedule-list__date')
      .should('contain', formatDate(testDateAdd(1), 'D'));

    cy
      .get('@scheduleList')
      .find('.schedule-list__list-row .schedule-list__day-list')
      .first()
      .as('actionList')
      .find('tr')
      .first()
      .should('contain', '6:45 AM')
      .should('contain', 'Outreach Planning')
      .find('.is-overdue')
      .parents('tr')
      .next()
      .should('contain', '10:31 AM')
      .should('contain', 'Second Action');

    cy
      .get('@actionList')
      .find('tr')
      .eq(2)
      .should('contain', '2:00 PM')
      .should('contain', 'Third Action');

    cy
      .get('@actionList')
      .find('tr')
      .last()
      .find('.js-patient-sidebar-button')
      .click()
      .wait('@routeWorkspacePatient');

    cy
      .get('.app-frame__sidebar .sidebar')
      .find('.worklist-patient-sidebar__patient-name')
      .should('contain', 'Test Patient');

    cy
      .get('[data-owner-filter-region]')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__group')
      .first()
      .click();

    cy
      .get('.app-frame__sidebar .sidebar')
      .should('not.exist');

    cy
      .get('[data-owner-filter-region]')
      .click();

    cy
      .get('.picklist')
      .find('.js-clear')
      .contains('Clinician McTester')
      .click();

    cy
      .get('@actionList')
      .find('tr')
      .last()
      .should('contain', 'No Time')
      .should('contain', 'Last Action')
      .find('.js-patient')
      .click();

    cy
      .url()
      .should('contain', 'patient/dashboard/1')
      .go('back');

    cy
      .get('@scheduleList')
      .find('.schedule-list__list-row')
      .first()
      .find('.schedule-list__date')
      .should('contain', formatDate(testDate(), 'D'))
      .parents('.schedule-list__list-row')
      .find('.js-form')
      .click();

    cy
      .url()
      .should('contain', 'patient-action/1/form/1')
      .go('back');

    cy
      .get('@scheduleList')
      .find('.schedule-list__list-row')
      .first()
      .find('.schedule-list__day-list-row')
      .contains('Last Action')
      .click('top');

    cy
      .url()
      .should('contain', 'patient/1/action/1')
      .go('back');

    cy
      .routeAction(fx => {
        fx.data = getAction({
          id: '2',
          attributes: {
            name: 'Outreach Planning: Review Referral, Medical Chart Review, Targeting Interventions, and other tasks',
            due_date: testDate(),
            due_time: '06:45:00',
          },
          relationships: {
            patient: getRelationship(testPatient2),
            flow: getRelationship(testFlow),
            state: getRelationship(stateInProgress),
          },
        });

        return fx;
      });

    cy
      .get('@actionList')
      .find('tr')
      .first()
      .find('.js-action')
      .click();

    cy
      .url()
      .should('contain', 'flow/1/action/2')
      .go('back');

    cy
      .get('@actionList')
      .find('tr')
      .last()
      .find('[data-details-region] div')
      .trigger('pointerover');

    cy
      .get('.tooltip')
      .should('contain', 'Last Action')
      .should('contain', 'Last Action Details');

    cy
      .get('@actionList')
      .find('tr')
      .eq(1)
      .find('[data-details-region]')
      .should('be.empty');
  });

  specify('maximum list count reached', function() {
    localStorage.setItem(`schedule_11111_${ workspaceOne.id }-${ STATE_VERSION }`, JSON.stringify({
      clinicianId: '11111',
      customFilters: {},
      dateFilters: {
        dateType: 'due_date',
        selectedDate: null,
        selectedMonth: dayjs(testDate()).startOf('month'),
        relativeDate: null,
      },
    }));

    cy
      .routesForPatientAction()
      .routeActions(fx => {
        fx.data = _.times(50, index => {
          return getAction({
            id: `${ index }`,
            attributes: {
              name: !index ? 'First Action' : `Action ${ index + 1 }`,
            },
            relationships() {
              return {
                patient: getRelationship(index % 2 === 0 ? testPatient1 : testPatient2),
              };
            },
          });
        });

        fx.included.push(testPatient1, testPatient2);

        fx.meta = {
          actions: {
            total: 1000,
          },
        };

        return fx;
      })
      .visit('/schedule')
      .wait('@routeActions');

    cy
      .get('[data-count-region]')
      .should('contain', 'Showing 50 of 1,000 Actions.')
      .should('contain', 'Try narrowing your filters.');

    cy
      .get('.list-page__header')
      .find('[data-search-region] .js-input')
      .as('listSearch')
      .type('First Action');

    cy
      .get('[data-count-region]')
      .should('contain', 'Showing 1 of 50 Actions.')
      .should('contain', 'Try narrowing your filters.');

    cy
      .get('@listSearch')
      .next()
      .click()
      .prev()
      .type('Test Patient');

    cy
      .get('[data-count-region]')
      .should('contain', 'Showing 25 of 50 Actions.')
      .should('contain', 'Try narrowing your filters.');

    cy
      .get('@listSearch')
      .next()
      .click()
      .prev()
      .type('Action');

    cy
      .get('[data-count-region]')
      .should('contain', 'Showing 50 of 1,000 Actions.')
      .should('contain', 'Try narrowing your filters.');
  });

  // TODO: Move to component test
  specify('filter schedule', function() {
    const testTime = dayjs(testDate()).hour(12).valueOf();

    cy
      .routeActions()
      .routeWorkspaceClinicians(fx => {
        fx.data[1] = getClinician({
          id: 'test-id',
          attributes: { name: 'Test Clinician' },
          relationships: {
            team: getRelationship(teamNurse),
            role: getRelationship(roleEmployee),
          },
        });

        return fx;
      })
      .visitOnClock('/schedule', { now: testTime, functionNames: ['Date'] });

    cy
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[clinician]=11111')
      .should('contain', 'filter[state]=22222,33333');

    cy
      .get('[data-owner-filter-region]')
      .click();

    cy
      .get('.picklist')
      .find('.js-clear')
      .should('contain', 'Clinician McTester');

    cy
      .get('.picklist')
      .find('.picklist__group')
      .first()
      .find('.js-picklist-item')
      .contains('Test Clinician')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`schedule_11111_${ workspaceOne.id }-${ STATE_VERSION }`));

        expect(storage.clinicianId).to.equal('test-id');
      });

    cy
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[clinician]=test-id');

    cy
      .get('[data-date-filter-region]')
      .should('contain', 'This Month')
      .click();

    cy
      .get('.app-frame__pop-region')
      .contains('Select from calendar')
      .click();

    cy
      .get('.datepicker')
      .find('.js-today')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`schedule_11111_${ workspaceOne.id }-${ STATE_VERSION }`));

        expect(storage.dateFilters.relativeDate).to.equal('today');
        expect(storage.dateFilters.selectedDate).to.be.null;
        expect(storage.dateFilters.selectedMonth).to.be.null;
      });

    cy
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', `filter[due_date]=${ testDate() },${ testDate() }`);

    cy
      .get('[data-date-filter-region]')
      .should('contain', 'Today')
      .click();

    cy
      .get('.app-frame__pop-region')
      .contains('Yesterday')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`schedule_11111_${ workspaceOne.id }-${ STATE_VERSION }`));

        expect(storage.dateFilters.relativeDate).to.equal('yesterday');
        expect(storage.dateFilters.selectedDate).to.be.null;
        expect(storage.dateFilters.selectedMonth).to.be.null;
      });

    cy
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', `filter[due_date]=${ testDateSubtract(1) },${ testDateSubtract(1) }`);

    cy
      .get('[data-date-filter-region]')
      .should('contain', 'Yesterday')
      .click();

    cy
      .get('.app-frame__pop-region')
      .contains('Select from calendar')
      .click();

    cy
      .get('.datepicker')
      .find('.is-today')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`schedule_11111_${ workspaceOne.id }-${ STATE_VERSION }`));

        expect(formatDate(storage.dateFilters.selectedDate, 'YYYY-MM-DD')).to.equal(testDate());
        expect(storage.dateFilters.relativeDate).to.be.null;
        expect(storage.dateFilters.selectedMonth).to.be.null;
      });

    cy
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', `filter[due_date]=${ testDate() },${ testDate() }`);

    cy
      .get('[data-date-filter-region]')
      .should('contain', formatDate(testDate(), 'MM/DD/YYYY'))
      .click();

    cy
      .get('.app-frame__pop-region')
      .contains('Select from calendar')
      .click();

    cy
      .get('.datepicker')
      .find('.js-next')
      .click();

    cy
      .get('.datepicker')
      .find('.js-month')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`schedule_11111_${ workspaceOne.id }-${ STATE_VERSION }`));

        expect(formatDate(storage.dateFilters.selectedMonth, 'MMM YYYY')).to.equal(formatDate(testDateAdd(1, 'month'), 'MMM YYYY'));
        expect(storage.dateFilters.selectedDate).to.be.null;
        expect(storage.dateFilters.relativeDate).to.be.null;
      });

    cy
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', `filter[due_date]=${ formatDate(dayjs(testDateAdd(1, 'month')).startOf('month'), 'YYYY-MM-DD') },${ formatDate(dayjs(testDateAdd(1, 'month')).endOf('month'), 'YYYY-MM-DD') }`);

    cy
      .get('[data-date-filter-region]')
      .should('contain', formatDate(testDateAdd(1, 'month'), 'MMM YYYY'))
      .click();

    cy
      .get('.app-frame__pop-region')
      .contains('Select from calendar')
      .click();

    cy
      .get('.datepicker')
      .find('.js-current-month')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`schedule_11111_${ workspaceOne.id }-${ STATE_VERSION }`));

        expect(storage.dateFilters.selectedMonth).to.be.null;
        expect(storage.dateFilters.selectedDate).to.be.null;
        expect(storage.dateFilters.relativeDate).to.equal('thismonth');
      });

    cy
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', `filter[due_date]=${ formatDate(dayjs(testDate()).startOf('month'), 'YYYY-MM-DD') },${ formatDate(dayjs(testDate()).endOf('month'), 'YYYY-MM-DD') }`);

    cy
      .get('[data-date-filter-region]')
      .should('contain', 'This Month')
      .click();

    cy
      .get('.date-filter')
      .contains('Select from calendar')
      .click();

    cy
      .get('.datepicker')
      .find('.js-current-week')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`schedule_11111_${ workspaceOne.id }-${ STATE_VERSION }`));

        expect(storage.dateFilters.selectedMonth).to.be.null;
        expect(storage.dateFilters.selectedDate).to.be.null;
        expect(storage.dateFilters.selectedWeek).to.be.null;
        expect(storage.dateFilters.relativeDate).to.equal('thisweek');
      });

    cy
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', `filter[due_date]=${ formatDate(dayjs(testDate()).startOf('week'), 'YYYY-MM-DD') },${ formatDate(dayjs(testDate()).endOf('week'), 'YYYY-MM-DD') }`);

    cy
      .get('.date-filter')
      .should('not.exist');

    cy
      .get('[data-date-filter-region]')
      .find('.js-prev')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`schedule_11111_${ workspaceOne.id }-${ STATE_VERSION }`));

        expect(storage.dateFilters.selectedMonth).to.be.null;
        expect(storage.dateFilters.selectedDate).to.be.null;
        expect(formatDate(storage.dateFilters.selectedWeek, 'MM/DD/YYYY')).to.equal(formatDate(dayjs(testDateSubtract(1, 'week')).startOf('week'), 'MM/DD/YYYY'));
        expect(storage.dateFilters.relativeDate).to.be.null;
      });

    cy
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', `filter[due_date]=${ formatDate(dayjs(testDateSubtract(1, 'week')).startOf('week'), 'YYYY-MM-DD') },${ formatDate(dayjs(testDateSubtract(1, 'week')).endOf('week'), 'YYYY-MM-DD') }`);

    cy
      .get('[data-date-filter-region]')
      .should('contain', formatDate(dayjs(testDateSubtract(1, 'week')).startOf('week'), 'MM/DD/YYYY'))
      .should('contain', formatDate(dayjs(testDateSubtract(1, 'week')).endOf('week'), 'MM/DD/YYYY'))
      .click();

    cy
      .get('.app-frame__pop-region')
      .contains('All Time')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`schedule_11111_${ workspaceOne.id }-${ STATE_VERSION }`));

        expect(storage.dateFilters.relativeDate).to.equal('alltime');
        expect(storage.dateFilters.selectedDate).to.be.null;
        expect(storage.dateFilters.selectedMonth).to.be.null;
      });

    cy
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('not.contain', 'filter[due_date]');

    cy
      .get('[data-date-filter-region]')
      .should('contain', 'All Time');

    cy
      .get('[data-date-filter-region]')
      .find('.js-prev')
      .should('not.exist');

    cy
      .get('[data-date-filter-region]')
      .find('.js-next')
      .should('not.exist');
  });

  specify('restricted employee', function() {
    cy
      .routeCurrentClinician(fx => {
        fx.data = getCurrentClinician({
          relationships: {
            role: getRelationship(roleNoFilterEmployee),
          },
        });

        return fx;
      })
      .routeActions()
      .visit('/schedule')
      .wait('@routeActions');

    cy
      .get('[data-owner-filter-region]')
      .should('be.empty');
  });

  specify('bulk edit', function() {
    localStorage.setItem(`schedule_11111_${ workspaceOne.id }-${ STATE_VERSION }`, JSON.stringify({
      clinicianId: '11111',
      customFilters: {},
      dateFilters: {
        dateType: 'due_date',
        selectedDate: null,
        selectedMonth: null,
        relativeDate: null,
      },
      actionsSelected: { '1': true, '4444': true },
    }));
    cy
      .routeActions(fx => {
        fx.data = _.times(20, index => {
          return getAction({
            id: `${ index + 1 }`,
            relationships: {
              owner: getRelationship('11111', 'clinicians'),
              state: getRelationship(index % 2 ? stateTodo : stateInProgress),
            },
          });
        });

        return fx;
      })
      .visit('/schedule')
      .wait('@routeActions');

    cy
      .get('[data-filters-region]')
      .as('filterRegion')
      .find('.js-bulk-edit')
      .should('contain', 'Edit 1 Action');

    cy
      .get('.schedule-list__table')
      .find('.schedule-list__list-row .is-selected')
      .should('have.length', 1)
      .first()
      .find('.js-select')
      .click();

    cy
      .get('.schedule-list__table')
      .find('.schedule-list__list-row .is-selected')
      .should('have.length', 0);

    cy
      .get('[data-select-all-region]')
      .click();

    cy
      .get('[data-select-all-region]')
      .find('.fa-square-check');

    cy
      .get('[data-select-all-region]')
      .click();

    cy
      .get('[data-select-all-region]')
      .click();

    cy
      .get('.js-bulk-edit')
      .next()
      .should('contain', 'Cancel')
      .click();

    cy
      .get('.js-bulk-edit')
      .should('not.exist');

    cy
      .get('.app-frame__content')
      .find('.schedule-list__table')
      .find('.fa-square-check')
      .should('have.length', 0);

    cy
      .get('.schedule-list__table')
      .find('.schedule-list__list-row .is-selected')
      .should('have.length', 0);

    cy
      .get('[data-select-all-region]')
      .find('.fa-square');

    cy
      .get('[data-select-all-region]')
      .click();

    cy
      .get('.app-frame__content')
      .find('.schedule-list__table')
      .find('.fa-square-check')
      .should('have.length', 20);

    cy
      .get('.schedule-list__table')
      .find('.schedule-list__list-row .is-selected')
      .should('have.length', 20);

    cy
      .get('[data-filters-region]')
      .find('.js-bulk-edit')
      .click();

    cy
      .get('.modal--sidebar')
      .as('bulkEditSidebar')
      .find('.sidebar__heading')
      .should('contain', 'Edit 20 Actions');

    cy
      .intercept('PATCH', '/api/actions/*', {
        statusCode: 204,
        body: {},
      })
      .as('patchAction');

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
      .find('.js-submit')
      .click()
      .wait('@patchAction')
      .wait('@routeActions');

    cy
      .get('.alert-box')
      .should('contain', '20 Actions have been updated');

    cy
      .get('.app-frame__content')
      .find('.schedule-list__table .fa-square')
      .should('have.length', 20);

    cy
      .get('[data-select-all-region]')
      .click();

    cy
      .get('@filterRegion')
      .find('.js-bulk-edit')
      .click();

    cy
      .get('@bulkEditSidebar')
      .find('[data-owner-region]')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('Clinician McTester')
      .click();

    cy
      .get('@bulkEditSidebar')
      .find('.js-submit')
      .click()
      .wait('@patchAction');

    cy
      .get('.alert-box')
      .should('contain', '20 Actions have been updated');

    cy
      .get('.app-frame__content')
      .find('.schedule-list__table .fa-square')
      .should('have.length', 20);

    cy
      .get('.app-frame__content')
      .find('.schedule-list__list-row .js-select')
      .then($els => {
        _.some($els, ($el, idx) => {
          cy
            .wrap($el)
            .click();

          if (idx === 4) return true;
        });
      });

    cy
      .get('[data-select-all-region]')
      .find('.fa-square-minus');

    cy
      .get('@filterRegion')
      .find('.js-bulk-edit')
      .click();

    cy
      .intercept('DELETE', '/api/actions/*', {
        statusCode: 204,
        body: {},
      });

    cy
      .get('.modal--sidebar')
      .find('.modal__header--sidebar')
      .should('contain', 'Edit 5 Actions')
      .find('.js-menu')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
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
      .should('contain', '5 Actions have been deleted');

    cy
      .get('.app-frame__content')
      .find('.schedule-list__table .schedule-list__day-list-row')
      .should('have.length', 15);

    cy
      .intercept('PATCH', '/api/actions/*', {
        statusCode: 400,
        body: {},
      })
      .as('patchActionFail');

    cy
      .get('[data-select-all-region]')
      .click();

    cy
      .get('@filterRegion')
      .find('.js-bulk-edit')
      .click();

    cy
      .get('@bulkEditSidebar')
      .find('.js-submit')
      .click()
      .wait('@patchActionFail');

    cy
      .get('.alert-box')
      .should('contain', 'Something went wrong. Please try again.');
  });

  specify('empty schedule', function() {
    cy
      .routeActions(fx => {
        fx.data = [];

        return fx;
      })
      .visit('/schedule')
      .wait('@routeActions');

    cy
      .get('[data-count-region] div')
      .should('be.empty');

    cy
      .get('.schedule-list__table')
      .should('contain', 'No Scheduled Actions');

    cy
      .get('[data-select-all-region]')
      .find('button')
      .should('be.disabled');
  });

  specify('find in list', function() {
    const testActions = [
      {
        attributes: {
          name: 'Last Action',
          due_date: testDate(),
          due_time: null,
        },
        relationships: {
          patient: getRelationship(testPatient1),
          state: getRelationship(stateTodo),
          form: getRelationship('1', 'forms'),
        },
      },
      {
        attributes: {
          name: 'First Action',
          due_date: testDate(),
          due_time: '06:45:00',
        },
        relationships: {
          patient: getRelationship(testPatient2),
          state: getRelationship(stateTodo),
          flow: getRelationship(testFlow),
        },
      },
      {
        attributes: {
          name: 'Second Action',
          due_date: testDate(),
          due_time: '10:30:00',
        },
        relationships: {
          patient: getRelationship(testPatient1),
          state: getRelationship(stateInProgress),
          flow: getRelationship(testFlow),
        },
      },
      {
        attributes: {
          name: 'Third Action',
          due_date: testDate(),
          due_time: '14:00:00',
        },
        relationships: {
          patient: getRelationship(testPatient1),
          state: getRelationship(stateInProgress),
          flow: getRelationship(testFlow),
        },
      },
    ];

    cy
      .routeActions(fx => {
        fx.data = [
          ..._.map(testActions, getAction),
          ..._.times(20 - testActions.length, index => {
            return getAction({
              attributes: { due_date: testDateAdd(index + 1) },
              relationships: {
                patient: getRelationship(index % 2 === 0 ? testPatient1 : testPatient2),
                state: getRelationship(index % 2 === 0 ? stateTodo : stateInProgress),
              },
            });
          }),
        ];

        fx.included.push(testPatient1, testPatient2, testFlow);

        return fx;
      })
      .visit('/schedule');

    cy
      .get('[data-count-region]')
      .should('not.contain', '20 Actions');

    cy
      .wait('@routeActions');

    cy
      .get('[data-count-region]')
      .should('contain', '20 Actions');

    cy
      .get('.list-page__header')
      .find('[data-search-region] .js-input')
      .as('listSearch')
      .should('have.attr', 'placeholder', 'Find in List...')
      .focus()
      .type('abc')
      .next()
      .should('have.class', 'js-clear');

    cy
      .get('.list-page__header')
      .find('[data-search-region] .list-search__container')
      .should('have.class', 'is-applied');

    cy
      .get('[data-count-region] div')
      .should('be.empty');

    cy
      .get('.list-page__list')
      .as('scheduleList')
      .find('.table-empty-list')
      .should('contain', 'No results match your Find in List search');

    cy
      .get('@listSearch')
      .next()
      .click();

    cy
      .get('.list-page__header')
      .find('[data-search-region] .list-search__container')
      .should('not.have.class', 'is-applied');

    cy
      .get('[data-count-region]')
      .should('contain', '20 Actions');

    cy
      .get('@scheduleList')
      .find('.schedule-list__day-list-row')
      .should('have.length', 20);

    cy
      .get('@listSearch')
      .type('Test');

    cy
      .get('[data-count-region]')
      .should('contain', '11 Actions');

    cy
      .get('@scheduleList')
      .find('.schedule-list__day-list-row')
      .should('have.length', 11);

    cy
      .get('@listSearch')
      .next()
      .click();

    cy
      .get('@listSearch')
      .type('Action');

    cy
      .get('[data-count-region]')
      .should('contain', '4 Actions');

    cy
      .get('@scheduleList')
      .find('.schedule-list__list-row')
      .first()
      .find('.schedule-list__day-list-row')
      .should('have.length', 4);

    cy
      .get('[data-select-all-region]')
      .click();

    cy
      .get('@scheduleList')
      .find('.schedule-list__day-list-row .fa-square-check')
      .should('have.length', 4);

    cy
      .get('[data-select-all-region]')
      .find('.fa-square-check');

    cy
      .get('[data-filters-region]')
      .find('.js-bulk-edit')
      .should('contain', 'Edit 4 Actions');

    cy
      .get('@listSearch')
      .next()
      .click();

    cy
      .get('[data-select-all-region]')
      .find('.fa-square-minus');

    cy
      .get('[data-filters-region]')
      .find('.js-bulk-edit')
      .should('contain', 'Edit 4 Actions');

    cy
      .get('[data-select-all-region]')
      .click();

    cy
      .get('@scheduleList')
      .find('.schedule-list__day-list-row .fa-square-check')
      .should('have.length', 20)
      .eq(4)
      .click();

    cy
      .get('[data-select-all-region]')
      .find('.fa-square-minus');

    cy
      .get('@listSearch')
      .type('Action');

    cy
      .get('[data-select-all-region]')
      .find('.fa-square-check');

    cy
      .get('[data-filters-region]')
      .find('.js-bulk-edit')
      .should('contain', 'Edit 4 Actions');

    cy
      .get('@listSearch')
      .next()
      .click()
      .should('not.be.visible');

    cy
      .get('@listSearch')
      .type('Parent Flow');

    cy
      .get('[data-count-region]')
      .should('contain', '3 Actions');

    cy
      .get('@scheduleList')
      .find('.schedule-list__day-list-row')
      .should('have.length', 3);

    cy
      .get('@listSearch')
      .next()
      .click();

    cy
      .get('@listSearch')
      .type('Second Action');

    cy
      .get('[data-count-region]')
      .should('contain', '1 Action')
      .should('not.contain', 'Actions');

    cy
      .get('@scheduleList')
      .find('.schedule-list__day-list-row')
      .should('have.length', 1)
      .first()
      .should('contain', 'Second Action');

    cy
      .get('@listSearch')
      .next()
      .click();

    cy
      .get('@listSearch')
      .type('In Progress');

    cy
      .get('@scheduleList')
      .find('.schedule-list__day-list-row')
      .should('contain', 'Test Patient')
      .should('contain', 'Second Action');

    cy
      .get('[data-date-filter-region]')
      .find('.js-prev')
      .click();

    cy
      .wait('@routeActions');

    cy
      .get('@listSearch')
      .invoke('val')
      .should('equal', 'In Progress');

    cy
      .get('[data-nav-content-region]')
      .find('[data-worklists-region]')
      .find('.app-nav__link')
      .contains('Owned By')
      .click()
      .wait('@routeActions');

    cy
      .get('[data-nav-content-region]')
      .find('[data-worklists-region]')
      .find('.app-nav__link')
      .contains('Schedule')
      .click()
      .wait('@routeActions');

    cy
      .get('@listSearch')
      .should('have.attr', 'value', 'In Progress');

    cy
      .get('.list-page__header')
      .find('[data-search-region] .list-search__container')
      .should('have.class', 'is-applied');
  });

  specify('click+shift multiselect', function() {
    const testActionAttrs = [
      {
        name: 'Last Action',
        due_date: testDate(),
        due_time: null,
      },
      {
        name: 'First Action',
        due_date: testDate(),
        due_time: null,
      },
      {
        name: 'Second Action',
        due_date: testDate(),
        due_time: '10:30:00',
      },
      {
        name: 'Third Action',
        due_date: testDate(),
        due_time: '14:00:00',
      },
    ];

    cy
      .routeActions(fx => {
        fx.data = [
          ..._.map(testActionAttrs, attributes => {
            return getAction({ attributes });
          }),
          ..._.times(20 - testActionAttrs.length, index => {
            return getAction({
              attributes: { due_date: testDateAdd(index + 1) },
            });
          }),
        ];

        return fx;
      })
      .visitOnClock('/schedule');

    cy
      .tick(60) // tick past debounce
      .get('.schedule-list__table')
      .as('scheduleList')
      .find('.schedule-list__list-row')
      .first()
      .find('.schedule-list__day-list-row')
      .first()
      .as('firstActionRow')
      .find('.js-select')
      .click();

    cy
      .get('@scheduleList')
      .find('.schedule-list__list-row')
      .eq(2)
      .find('.schedule-list__day-list-row')
      .first()
      .as('sixthActionRow')
      .find('.js-select')
      .click({ shiftKey: true });

    cy
      .get('@scheduleList')
      .find('.schedule-list__day-list-row.is-selected')
      .should('have.length', 6);

    cy
      .get('[data-filters-region]')
      .as('filterRegion')
      .find('.js-bulk-edit')
      .should('contain', 'Edit 6 Actions');

    cy
      .get('[data-filters-region]')
      .find('.js-cancel')
      .click();

    cy
      .get('@sixthActionRow')
      .find('.js-select')
      .click();

    cy
      .get('@firstActionRow')
      .find('.js-select')
      .click({ shiftKey: true });

    cy
      .get('@scheduleList')
      .find('.schedule-list__day-list-row.is-selected')
      .should('have.length', 6);

    cy
      .get('[data-filters-region]')
      .as('filterRegion')
      .find('.js-bulk-edit')
      .should('contain', 'Edit 6 Actions');

    cy
      .get('[data-filters-region]')
      .find('.js-cancel')
      .click();

    cy
      .get('@firstActionRow')
      .find('.js-select')
      .click();

    cy
      .get('@firstActionRow')
      .find('.js-select')
      .click();

    cy
      .get('@sixthActionRow')
      .find('.js-select')
      .click({ shiftKey: true });

    cy
      .get('@scheduleList')
      .find('.schedule-list__day-list-row.is-selected')
      .should('have.length', 1);

    cy
      .get('[data-filters-region]')
      .find('.js-cancel')
      .click();

    cy
      .get('@firstActionRow')
      .find('.js-select')
      .click();

    cy
      .get('[data-filters-region]')
      .find('.js-cancel')
      .click();

    cy
      .get('@sixthActionRow')
      .find('.js-select')
      .click({ shiftKey: true });

    cy
      .get('@scheduleList')
      .find('.schedule-list__day-list-row.is-selected')
      .should('have.length', 1);

    cy
      .get('[data-filters-region]')
      .find('.js-cancel')
      .click();

    cy
      .get('@firstActionRow')
      .find('.js-select')
      .click();

    cy
      .get('.list-page__header')
      .find('[data-search-region] .js-input')
      .focus()
      .type('abcd');

    cy
      .get('.list-page__header')
      .find('[data-search-region] .js-input')
      .next()
      .click();

    cy
      .get('@scheduleList')
      .find('.schedule-list__list-row')
      .first()
      .find('.schedule-list__day-list-row')
      .eq(2)
      .find('.js-select')
      .click({ shiftKey: true });

    cy
      .get('@scheduleList')
      .find('.schedule-list__day-list-row.is-selected')
      .should('have.length', 2);

    cy
      .get('[data-filters-region]')
      .find('.js-cancel')
      .click();

    cy
      .get('@firstActionRow')
      .find('.js-select')
      .click();

    cy
      .navigate('/worklist');

    cy
      .go('back');

    cy
      .get('@scheduleList')
      .find('.schedule-list__list-row')
      .first()
      .find('.schedule-list__day-list-row')
      .eq(2)
      .find('.js-select')
      .click({ shiftKey: true });

    cy
      .get('@scheduleList')
      .find('.schedule-list__day-list-row.is-selected')
      .should('have.length', 2);
  });

  specify('bulk editing with work:owned:manage permission', function() {
    const testActions = [
      {
        attributes: {
          name: 'Last Action',
          due_date: testDate(),
          due_time: null,
        },
        relationships: {
          owner: getRelationship('11111', 'clinicians'),
        },
      },
      {
        attributes: {
          name: 'First Action',
          due_date: testDate(),
          due_time: null,
        },
        relationships: {
          owner: getRelationship(teamNurse),
        },
      },
      {
        attributes: {
          name: 'Second Action',
          due_date: testDateAdd(3),
          due_time: '10:30:00',
        },
        relationships: {
          owner: getRelationship(teamNurse),
        },
      },
      {
        attributes: {
          name: 'Third Action',
          due_date: testDateAdd(3),
          due_time: '14:00:00',
        },
        relationships: {
          owner: getRelationship('11111', 'clinicians'),
        },
      },
    ];

    cy
      .routeCurrentClinician(fx => {
        fx.data = getCurrentClinician({
          relationships: {
            role: getRelationship(roleNoFilterEmployee),
          },
        });
        return fx;
      })
      .routeActions(fx => {
        fx.data = _.map(testActions, getAction);

        return fx;
      })
      .visit('/schedule');

    cy
      .intercept('PATCH', '/api/actions/*', {
        statusCode: 204,
        body: {},
      })
      .as('patchAction');

    cy
      .get('.schedule-list__table')
      .as('scheduleList')
      .find('.schedule-list__list-row')
      .first()
      .find('.schedule-list__day-list-row')
      .first()
      .as('firstActionRow')
      .find('.js-select')
      .click();

    cy
      .get('.schedule-list__table')
      .as('scheduleList')
      .find('.schedule-list__list-row')
      .last()
      .find('.schedule-list__day-list-row')
      .last()
      .as('lastActionRow')
      .find('.js-select')
      .click({ shiftKey: true });

    cy
      .get('[data-filters-region]')
      .find('.js-bulk-edit')
      .should('contain', 'Edit 2 Actions')
      .click();

    cy
      .get('.modal--sidebar')
      .as('sidebar')
      .find('[data-state-region]')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('To Do')
      .click();

    cy
      .get('@sidebar')
      .find('.js-submit')
      .click()
      .wait(['@patchAction', '@patchAction']);

    cy
      .get('.alert-box')
      .should('contain', '2 Actions have been updated');

    cy
      .get('[data-select-all-region] button:enabled')
      .click();

    cy
      .get('[data-filters-region]')
      .find('.js-bulk-edit')
      .should('contain', 'Edit 2 Actions')
      .click();

    cy
      .get('.modal--sidebar')
      .as('sidebar')
      .find('[data-owner-region]')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('Nurse')
      .click();

    cy
      .get('@sidebar')
      .find('.js-submit')
      .click()
      .wait(['@patchAction', '@patchAction']);

    cy
      .get('.alert-box')
      .should('contain', '2 Actions have been updated');

    cy
      .get('[data-select-all-region] button:disabled');
  });

  specify('bulk editing with work:team:manage permission', function() {
    const testActions = [
      {
        attributes: {
          name: 'Owned by team member',
          due_date: testDateAdd(1),
          due_time: '9:00:00',
        },
        relationships: {
          owner: getRelationship(teamCoordinator),
          state: getRelationship(stateInProgress),
        },
      },
      {
        attributes: {
          name: 'Owned by non team member',
          due_date: testDateAdd(1),
          due_time: '10:00:00',
        },
        relationships: {
          owner: getRelationship('3', 'clinicians'),
          state: getRelationship(stateInProgress),
        },
      },
    ];

    const currentClinician = getCurrentClinician({
      relationships: {
        role: getRelationship(roleTeamEmployee),
        team: getRelationship(teamNurse),
      },
    });

    cy
      .routeCurrentClinician(fx => {
        fx.data = currentClinician;

        return fx;
      })
      .routeWorkspaceClinicians(fx => {
        fx.data = [
          currentClinician,
          getClinician({
            id: '2',
            attributes: {
              name: 'Team Member',
            },
            relationships: {
              team: getRelationship(teamNurse),
            },
          }),
          getClinician({
            id: '3',
            attributes: {
              name: 'Non Team Member',
            },
            relationships: {
              team: getRelationship(teamCoordinator),
            },
          }),
        ];

        return fx;
      })
      .routeActions(fx => {
        fx.data = _.map(testActions, getAction);

        return fx;
      })
      .visit('/schedule');

    cy
      .get('.schedule-list__table')
      .find('.schedule-list__list-row')
      .first()
      .find('.schedule-list__day-list-row')
      .as('actionDayListRows')
      .first()
      .find('.js-select')
      .should('not.exist');

    cy
      .get('@actionDayListRows')
      .last()
      .find('.js-select')
      .should('not.exist');
  });

  specify('actions on a done-flow', function() {
    const doneFlow = getFlow({
      relationships: {
        state: getRelationship(stateDone),
      },
    });

    cy
      .routesForPatientAction()
      .routeActions(fx => {
        fx.data = getActions({
          relationships: {
            flow: getRelationship(doneFlow),
          },
        });

        fx.included.push(doneFlow);

        return fx;
      })
      .visit('/schedule');

    cy
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', 'fields[flows]=name,state');

    cy
      .get('.app-frame__content')
      .find('.schedule-list__list-row .js-select')
      .should('not.exist');
  });

  specify('500 error', function() {
    cy
      .routesForPatientAction()
      .routeActions()
      .visit('/schedule')
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[state]=22222,33333');

    cy
      .intercept('GET', '/api/actions?*', {
        statusCode: 500,
        body: {},
      })
      .as('routeActions');

    cy
      .get('.list-page__filters')
      .find('[data-filters-region]')
      .find('button')
      .click();

    cy
      .get('.app-frame__sidebar .sidebar')
      .find('[data-states-filters-region]')
      .find('[data-check-region]')
      .eq(0)
      .click();

    cy
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[state]=33333');

    cy
      .routeActions();

    cy
      .get('.error-page')
      .contains('Back to Your Workspace')
      .click();

    cy
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[state]=22222,33333');
  });
});
