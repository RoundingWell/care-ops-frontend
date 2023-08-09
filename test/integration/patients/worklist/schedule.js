import _ from 'underscore';
import dayjs from 'dayjs';

import formatDate from 'helpers/format-date';
import { testDate, testDateAdd, testDateSubtract } from 'helpers/test-date';

const states = ['22222', '33333'];

const STATE_VERSION = 'v6';

context('schedule page', function() {
  specify('display schedule', function() {
    const testDateTime = dayjs().hour(12).minute(0).valueOf();

    localStorage.setItem(`schedule_11111_11111-${ STATE_VERSION }`, JSON.stringify({
      clinicianId: '11111',
      filters: {},
      dateFilters: {
        dateType: 'due_date',
        selectedDate: null,
        selectedMonth: dayjs(testDate()).startOf('month'),
        relativeDate: null,
      },
    }));

    cy.clock(testDateTime, ['Date']);

    cy
      .routesForPatientAction()
      .routeActions(fx => {
        fx.data[0].attributes = {
          name: 'Last Action',
          details: 'Last Action Details',
          due_date: testDate(),
          due_time: null,
        };
        fx.data[0].id = '1';
        fx.data[0].relationships.patient.data.id = '1';
        fx.data[0].relationships.state.data.id = states[0];
        fx.data[0].relationships.form = { data: { id: '1' } };

        fx.data[1].attributes = {
          name: 'Outreach Planning: Review Referral, Medical Chart Review, Targeting Interventions, and other tasks',
          due_date: testDate(),
          due_time: '06:45:00',
        };
        fx.data[1].id = '2';
        fx.data[1].relationships.patient.data.id = '2';
        fx.data[1].relationships.flow = { data: { id: '1' } };
        fx.data[1].relationships.state.data.id = states[1];

        fx.data[2].attributes = {
          name: 'Second Action',
          details: null,
          due_date: testDate(),
          due_time: '10:31:00',
        };
        fx.data[2].id = '3';
        fx.data[2].relationships.patient.data.id = '1';
        fx.data[2].relationships.state.data.id = states[1];

        fx.data[3].attributes = {
          name: 'Third Action',
          due_date: testDate(),
          due_time: '14:00:00',
        };
        fx.data[3].id = '4';
        fx.data[3].relationships.patient.data.id = '1';
        fx.data[3].relationships.flow = { data: { id: '1' } };
        fx.data[3].relationships.state.data.id = states[1];

        _.each(fx.data.slice(4, 20), (action, idx) => {
          action.id = `${ idx + 5 }`;
          action.attributes.due_date = testDateAdd(idx + 2); // +2 to test that dates with no actions due are excluded

          action.relationships.state.data.id = idx % 2 === 0 ? states[0] : states[1];
        });

        fx.included.push(
          {
            id: '1',
            type: 'flows',
            attributes: _.extend(_.sample(this.fxFlows), {
              name: 'Complex Care Management',
              id: '1',
            }),
          },
          {
            id: '1',
            type: 'patients',
            attributes: _.extend(_.sample(this.fxPatients), {
              first_name: 'Test',
              last_name: 'Patient',
              id: '1',
            }),
          },
          {
            id: '2',
            type: 'patients',
            attributes: _.extend(_.sample(this.fxPatients), {
              first_name: 'LongTest',
              last_name: 'PatientName',
              id: '1',
            }),
          },
        );

        return fx;
      })
      .routeAction(fx => {
        fx.data.attributes = {
          name: 'Last Action',
          due_date: testDate(),
          due_time: null,
        };
        fx.data.id = '1';
        fx.data.relationships.patient.data.id = '1';
        fx.data.relationships.state.data.id = states[0];
        fx.data.relationships.form = { data: { id: '1' } };

        return fx;
      })
      .routeFlow()
      .routeFlowActions()
      .routePatientByFlow()
      .routeFormByAction()
      .visit('/schedule')
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
      .should('contain', formatDate(testDateAdd(17), 'D'));

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
      .should('contain', formatDate(testDateAdd(2), 'D'));

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
      .click();

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
      .eq(1)
      .click();

    cy
      .get('.app-frame__sidebar .sidebar')
      .should('not.exist');

    cy
      .get('[data-owner-filter-region]')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__group')
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
        fx.data.attributes = {
          name: 'Outreach Planning: Review Referral, Medical Chart Review, Targeting Interventions, and other tasks',
          due_date: testDate(),
          due_time: '06:45:00',
        };
        fx.data.id = '2';
        fx.data.relationships.patient.data.id = '2';
        fx.data.relationships.flow = { data: { id: '1' } };
        fx.data.relationships.state.data.id = states[1];

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

    cy.clock().invoke('restore');
  });

  specify('maximum list count reached', function() {
    localStorage.setItem(`schedule_11111_11111-${ STATE_VERSION }`, JSON.stringify({
      clinicianId: '11111',
      filters: {},
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
        const action = _.sample(fx.data);

        fx.data = _.times(50, n => {
          const clone = _.clone(action);

          const actionName = n === 0 ? 'First Action' : `Action ${ n + 1 }`;
          const patientId = n % 2 ? '1' : '2';

          clone.id = `${ n }`;
          clone.attributes = {
            name: actionName,
            due_date: testDate(),
            due_time: null,
          };

          clone.relationships = {
            owner: {
              data: {
                id: '11111',
                type: 'teams',
              },
            },
            state: { data: { id: '22222' } },
            patient: { data: { id: patientId } },
          };

          return clone;
        });

        fx.included = [
          {
            id: '1',
            type: 'patients',
            attributes: {
              first_name: 'Test',
              last_name: 'Patient',
            },
          },
          {
            id: '2',
            type: 'patients',
            attributes: {
              first_name: 'Other',
              last_name: 'Patient',
            },
          },
        ];

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

  specify('filter schedule', function() {
    const testTime = dayjs(testDate()).hour(12).valueOf();

    cy
      .routeActions()
      .routeWorkspaceClinicians(fx => {
        fx.data[1].id = 'test-id';
        fx.data[1].attributes.name = 'Test Clinician';
        fx.data[1].relationships.team = { data: { id: '11111' } };
        fx.data[1].relationships.role = { data: { id: '33333' } };

        return fx;
      })
      .visit('/schedule');

    cy
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[clinician]=11111')
      .should('contain', 'filter[state]=22222,33333');

    cy.clock(testTime, ['Date']);

    cy
      .get('[data-owner-filter-region]')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__group')
      .first()
      .should('contain', 'Clinician McTester')
      .next()
      .find('.js-picklist-item')
      .contains('Test Clinician')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`schedule_11111_11111-${ STATE_VERSION }`));

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
        const storage = JSON.parse(localStorage.getItem(`schedule_11111_11111-${ STATE_VERSION }`));

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
        const storage = JSON.parse(localStorage.getItem(`schedule_11111_11111-${ STATE_VERSION }`));

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
        const storage = JSON.parse(localStorage.getItem(`schedule_11111_11111-${ STATE_VERSION }`));

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
        const storage = JSON.parse(localStorage.getItem(`schedule_11111_11111-${ STATE_VERSION }`));

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
        const storage = JSON.parse(localStorage.getItem(`schedule_11111_11111-${ STATE_VERSION }`));

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
        const storage = JSON.parse(localStorage.getItem(`schedule_11111_11111-${ STATE_VERSION }`));

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
        const storage = JSON.parse(localStorage.getItem(`schedule_11111_11111-${ STATE_VERSION }`));

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
        const storage = JSON.parse(localStorage.getItem(`schedule_11111_11111-${ STATE_VERSION }`));

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

    cy.clock().invoke('restore');
  });

  specify('restricted employee', function() {
    cy
      .routeCurrentClinician(fx => {
        fx.data.id = '123456';
        fx.data.attributes.enabled = true;
        fx.data.relationships.role.data.id = '66666';
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
    localStorage.setItem(`schedule_11111_11111-${ STATE_VERSION }`, JSON.stringify({
      clinicianId: '11111',
      filters: {},
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
        fx.data[0].id = '1';
        _.each(fx.data, (action, idx) => {
          action.relationships.state.data.id = idx % 2 === 0 ? states[0] : states[1];
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
        statusCode: 401,
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
    cy
      .routeActions(fx => {
        fx.data[0].attributes = {
          name: 'Last Action',
          due_date: testDate(),
          due_time: null,
        };
        fx.data[0].id = '1';
        fx.data[0].relationships.patient.data.id = '1';
        fx.data[0].relationships.state.data.id = states[0];
        fx.data[0].relationships.form = { data: { id: '1' } };

        fx.data[1].attributes = {
          name: 'First Action',
          due_date: testDate(),
          due_time: '06:45:00',
        };
        fx.data[1].id = '2';
        fx.data[1].relationships.patient.data.id = '2';
        fx.data[1].relationships.flow = { data: { id: '1' } };
        fx.data[1].relationships.state.data.id = states[1];

        fx.data[2].attributes = {
          name: 'Second Action',
          due_date: testDate(),
          due_time: '10:30:00',
        };
        fx.data[2].id = '3';
        fx.data[2].relationships.patient.data.id = '1';
        fx.data[2].relationships.flow = { data: { id: '1' } };
        fx.data[2].relationships.state.data.id = states[1];

        fx.data[3].attributes = {
          name: 'Third Action',
          due_date: testDate(),
          due_time: '14:00:00',
        };
        fx.data[3].id = '4';
        fx.data[3].relationships.patient.data.id = '1';
        fx.data[3].relationships.flow = { data: { id: '1' } };
        fx.data[3].relationships.state.data.id = states[1];

        _.each(fx.data.slice(4, 20), (action, idx) => {
          action.id = `${ idx + 5 }`;
          action.attributes.due_date = testDateAdd(idx + 1);

          if (idx % 2) {
            action.relationships.state.data.id = states[0];
            action.relationships.patient.data.id = '1';
          } else {
            action.relationships.state.data.id = states[1];
          }
        });

        fx.included.push(
          {
            id: 1,
            type: 'flows',
            attributes: _.extend(_.sample(this.fxActions), {
              name: 'Parent Flow',
              id: '1',
            }),
          },
          {
            id: '1',
            type: 'patients',
            attributes: _.extend(_.sample(this.fxPatients), {
              first_name: 'Test',
              last_name: 'Patient',
            }),
          },
          {
            id: '2',
            type: 'patients',
            attributes: _.extend(_.sample(this.fxPatients), {
              first_name: 'LongTest',
              last_name: 'PatientName',
            }),
          },
        );

        return fx;
      }, 100)
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
    cy
      .routeActions(fx => {
        fx.data[0].attributes = {
          name: 'Last Action',
          due_date: testDate(),
          due_time: null,
        };
        fx.data[0].id = '1';

        fx.data[1].attributes = {
          name: 'First Action',
          due_date: testDate(),
          due_time: null,
        };
        fx.data[1].id = '2';

        fx.data[2].attributes = {
          name: 'Second Action',
          due_date: testDate(),
          due_time: '10:30:00',
        };
        fx.data[2].id = '3';

        fx.data[3].attributes = {
          name: 'Third Action',
          due_date: testDate(),
          due_time: '14:00:00',
        };
        fx.data[3].id = '4';

        _.each(fx.data.slice(4, 20), (action, idx) => {
          action.attributes.due_date = testDateAdd(idx + 1);
        });

        return fx;
      }, 100)
      .visit('/schedule');

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

  specify('bulk editing without work:manage permission', function() {
    cy
      .routeCurrentClinician(fx => {
        fx.data.relationships.role = { data: { id: '66666' } };
        return fx;
      })
      .routeActions(fx => {
        fx.data = _.sample(fx.data, 4);

        fx.data[0].attributes = {
          name: 'Last Action',
          due_date: testDate(),
          due_time: null,
        };
        fx.data[0].relationships.owner = { data: { id: '11111', type: 'clinicians' } };
        fx.data[0].id = '1';

        fx.data[1].attributes = {
          name: 'First Action',
          due_date: testDate(),
          due_time: null,
        };
        fx.data[1].relationships.owner = { data: { id: '11111', type: 'teams' } };
        fx.data[1].id = '2';

        fx.data[2].attributes = {
          name: 'Second Action',
          due_date: testDateAdd(3),
          due_time: '10:30:00',
        };
        fx.data[2].relationships.owner = { data: { id: '11111', type: 'teams' } };
        fx.data[2].id = '3';

        fx.data[3].attributes = {
          name: 'Third Action',
          due_date: testDateAdd(3),
          due_time: '14:00:00',
        };
        fx.data[3].relationships.owner = { data: { id: '11111', type: 'clinicians' } };
        fx.data[3].id = '4';

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
});
