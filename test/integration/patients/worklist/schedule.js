import _ from 'underscore';
import dayjs from 'dayjs';

import formatDate from 'helpers/format-date';
import { testDate } from 'helpers/test-date';

const states = ['22222', '33333'];

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

context('schedule page', function() {
  specify('display schedule', function() {
    const testDateTime = dayjs().hour(10).minute(0).utc().valueOf();
    const today = dayjs(testDateTime);
    let dueDate = dayjs(testDateTime).startOf('month');

    localStorage.setItem('schedule_11111', JSON.stringify({
      filters: {
        groupId: null,
        clinicianId: '11111',
      },
      dateFilters: {
        dateType: 'due_date',
        selectedDate: null,
        selectedMonth: today.startOf('month'),
        relativeDate: null,
      },
    }));

    cy.clock(testDateTime, ['Date']);

    cy
      .server()
      .routeGroupsBootstrap(fx => {
        fx.data[0].relationships.clinicians.data.push({
          id: 'test-id',
          type: 'clinicians',
        });
        return fx;
      }, [testGroups[0]], fx => {
        fx.data[0].attributes.name = 'Test Clinician';
        fx.data[0].id = 'test-id';

        return fx;
      })
      .routeActions(fx => {
        fx.data[0].attributes = {
          name: 'Last Action',
          due_date: dueDate.format('YYYY-MM-DD'),
          due_time: null,
        };
        fx.data[0].id = '1';
        fx.data[0].relationships.patient.data.id = '1';
        fx.data[0].relationships.state.data.id = states[0];
        fx.data[0].relationships.form = { data: { id: '1' } };

        fx.data[1].attributes = {
          name: 'Outreach Planning: Review Referral, Medical Chart Review, Targeting Interventions',
          due_date: dueDate.format('YYYY-MM-DD'),
          due_time: '06:45:00',
        };
        fx.data[1].id = '2';
        fx.data[1].relationships.patient.data.id = '1';
        fx.data[1].relationships.flow = { data: { id: '1' } };
        fx.data[1].relationships.state.data.id = states[1];

        fx.data[2].attributes = {
          name: 'Second Action',
          due_date: dueDate.format('YYYY-MM-DD'),
          due_time: '10:30:00',
        };
        fx.data[2].id = '3';
        fx.data[2].relationships.patient.data.id = '1';
        fx.data[2].relationships.flow = { data: { id: '1' } };
        fx.data[2].relationships.state.data.id = states[1];

        fx.data[3].attributes = {
          name: 'Third Action',
          due_date: dueDate.format('YYYY-MM-DD'),
          due_time: '14:00:00',
        };
        fx.data[3].id = '3';
        fx.data[3].relationships.patient.data.id = '1';
        fx.data[3].relationships.flow = { data: { id: '1' } };
        fx.data[3].relationships.state.data.id = states[1];

        _.each(fx.data.slice(3, 10), (action, idx) => {
          action.id = `${ idx + 4 }`;
          action.attributes.due_date = dueDate.format('YYYY-MM-DD');

          action.relationships.state.data.id = idx % 2 === 0 ? states[0] : states[1];

          dueDate = dueDate.add(1, 'day');
        });

        dueDate = dueDate.endOf('month');

        _.each(fx.data.slice(10, 20), (action, idx) => {
          action.id = `${ idx + 11 }`;
          action.attributes.due_date = dueDate.format('YYYY-MM-DD');

          action.relationships.state.data.id = idx % 2 === 0 ? states[0] : states[1];

          dueDate = dueDate.subtract(1, 'day');
        });

        fx.included.push(
          {
            id: 1,
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
              id: 1,
            }),
          },
        );

        return fx;
      })
      .routeAction()
      .routePatientByAction()
      .routePatient()
      .routeFlow()
      .routeFlowActions()
      .visit('/schedule')
      .wait('@routeActions');

    cy
      .get('[data-date-filter-region]')
      .should('contain', today.startOf('month').format('MMM YYYY'));

    cy
      .get('.schedule-list__table')
      .as('scheduleList')
      .find('.schedule-list__list-row')
      .first()
      .find('.schedule-list__date')
      .should('contain', today.startOf('month').format('D'))
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
      .find('.js-action')
      .contains('Last Action')
      .click();

    cy
      .url()
      .should('contain', 'patient/1/action/1')
      .go('back');

    cy
      .get('@scheduleList')
      .find('.schedule-list__list-row')
      .last()
      .find('.schedule-list__date')
      .should('contain', today.endOf('month').format('D'));

    cy
      .get('@scheduleList')
      .find('.schedule-list__date.is-today')
      .should('contain', today.format('D'))
      .next()
      .should('contain', today.format('MMM, ddd'));

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
      .should('contain', '10:30 AM')
      .should('contain', 'Second Action');

    cy
      .get('@actionList')
      .find('tr')
      .eq(2)
      .should('contain', '2:00 PM')
      .should('contain', 'Third Action')
      .next()
      .should('contain', 'No Time')
      .should('contain', 'Last Action')
      .find('.js-patient')
      .click();

    cy
      .url()
      .should('contain', 'patient/dashboard/1')
      .go('back');

    cy
      .get('@actionList')
      .find('tr')
      .first()
      .find('.js-action')
      .trigger('mouseover');

    cy
      .get('.tooltip')
      .should('contain', 'Complex Care Management')
      .should('contain', 'Outreach Planning');

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

    cy.clock().invoke('restore');
  });

  specify('filter schedule', function() {
    const testTime = dayjs().hour(10).utc().valueOf();
    const today = dayjs(testTime);

    cy
      .server()
      .routeGroupsBootstrap(fx => {
        fx.data[0].relationships.clinicians.data.push({
          id: 'test-id',
          type: 'clinicians',
        });
        return fx;
      }, testGroups, fx => {
        fx.data[0].attributes.name = 'Test Clinician';
        fx.data[0].id = 'test-id';

        return fx;
      })
      .routeActions()
      .visit('/schedule')
      .wait('@routeActions');

    cy.clock(testTime, ['Date']);

    cy
      .get('[data-filters-region]')
      .as('filterRegion')
      .find('[data-owner-filter-region]')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__group')
      .first()
      .should('contain', 'Clinician McTester')
      .next()
      .find('.picklist__item')
      .contains('Test Clinician')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem('schedule_11111'));

        expect(storage.filters.clinicianId).to.equal('test-id');
      });

    cy
      .wait('@routeActions')
      .its('url')
      .should('contain', 'filter[clinician]=test-id');

    cy
      .get('@filterRegion')
      .find('[data-group-filter-region]')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__item')
      .contains('Group One')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem('schedule_11111'));

        expect(storage.filters.groupId).to.equal('1');
      });

    cy
      .wait('@routeActions')
      .its('url')
      .should('contain', 'filter[group]=1');

    cy
      .get('[data-date-filter-region]')
      .should('contain', 'This Month')
      .click();

    cy
      .get('.datepicker')
      .find('.js-today')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem('schedule_11111'));

        expect(storage.dateFilters.relativeDate).to.equal('today');
        expect(storage.dateFilters.selectedDate).to.be.null;
        expect(storage.dateFilters.selectedMonth).to.be.null;
      });

    cy
      .wait('@routeActions')
      .its('url')
      .should('contain', `filter[due_date]=${ today.startOf('day').format('YYYY-MM-DD') },${ today.endOf('day').format('YYYY-MM-DD') }`);

    cy
      .get('[data-date-filter-region]')
      .should('contain', 'Today')
      .click();

    cy
      .get('.datepicker')
      .find('.js-yesterday')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem('schedule_11111'));

        expect(storage.dateFilters.relativeDate).to.equal('yesterday');
        expect(storage.dateFilters.selectedDate).to.be.null;
        expect(storage.dateFilters.selectedMonth).to.be.null;
      });

    cy
      .wait('@routeActions')
      .its('url')
      .should('contain', `filter[due_date]=${ today.subtract(1, 'day').startOf('day').format('YYYY-MM-DD') },${ today.subtract(1, 'day').endOf('day').format('YYYY-MM-DD') }`);

    cy
      .get('[data-date-filter-region]')
      .should('contain', 'Yesterday')
      .click();

    cy
      .get('.datepicker')
      .find('.is-today')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem('schedule_11111'));

        expect(formatDate(storage.dateFilters.selectedDate, 'YYYY-MM-DD')).to.equal(testDate());
        expect(storage.dateFilters.relativeDate).to.be.null;
        expect(storage.dateFilters.selectedMonth).to.be.null;
      });

    cy
      .wait('@routeActions')
      .its('url')
      .should('contain', `filter[due_date]=${ today.startOf('day').format('YYYY-MM-DD') },${ today.endOf('day').format('YYYY-MM-DD') }`);

    cy
      .get('[data-date-filter-region]')
      .should('contain', formatDate(testDate(), 'MM/DD/YYYY'))
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
        const storage = JSON.parse(localStorage.getItem('schedule_11111'));

        expect(formatDate(storage.dateFilters.selectedMonth, 'MMM YYYY')).to.equal(dayjs().add(1, 'month').format('MMM YYYY'));
        expect(storage.dateFilters.selectedDate).to.be.null;
        expect(storage.dateFilters.relativeDate).to.be.null;
      });

    cy
      .wait('@routeActions')
      .its('url')
      .should('contain', `filter[due_date]=${ today.add(1, 'month').startOf('month').format('YYYY-MM-DD') },${ today.add(1, 'month').endOf('month').format('YYYY-MM-DD') }`);

    cy
      .get('[data-date-filter-region]')
      .should('contain', today.add(1, 'month').format('MMM YYYY'))
      .click();

    cy
      .get('.datepicker')
      .find('.js-current-month')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem('schedule_11111'));

        expect(storage.dateFilters.selectedMonth).to.be.null;
        expect(storage.dateFilters.selectedDate).to.be.null;
        expect(storage.dateFilters.relativeDate).to.be.null;
      });

    cy
      .wait('@routeActions')
      .its('url')
      .should('contain', `filter[due_date]=${ today.startOf('month').format('YYYY-MM-DD') },${ today.endOf('month').format('YYYY-MM-DD') }`);

    cy.clock().invoke('restore');
  });

  specify('bulk edit', function() {
    localStorage.setItem('schedule_11111', JSON.stringify({
      filters: {
        groupId: null,
        clinicianId: '11111',
      },
      dateFilters: {
        dateType: 'due_date',
        selectedDate: null,
        selectedMonth: null,
        relativeDate: null,
      },
      selectedActions: [{ '1': true }, { '4444': true }],
    }));
    cy
      .server()
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
      .get('[data-select-all-region]')
      .find('button')
      .click();

    cy
      .get('[data-select-all-region]')
      .find('.fa-check-square');

    cy
      .get('[data-select-all-region]')
      .find('button')
      .click();

    cy
      .get('[data-select-all-region]')
      .find('button')
      .click();

    cy
      .get('.app-frame__content')
      .find('.schedule-list__table')
      .find('.fa-check-square')
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
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/actions/*',
        response: {},
      })
      .as('patchAction');

    cy
      .get('@bulkEditSidebar')
      .find('.js-submit')
      .click()
      .wait('@patchAction');

    cy
      .get('.alert-box')
      .should('contain', '20 Actions have been updated');

    cy
      .get('[data-select-all-region]')
      .find('.fa-square');

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
      .get('@filterRegion')
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
      .should('contain', 'Edit 5 Actions')
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
      .should('contain', '5 Actions have been deleted');

    cy
      .get('.app-frame__content')
      .find('.schedule-list__table .schedule-list__day-list-row')
      .should('have.length', 15);

    cy
      .route({
        status: 401,
        method: 'PATCH',
        url: '/api/actions/*',
        response: {},
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
      .server()
      .routeActions(fx => {
        fx.data = [];

        return fx;
      })
      .visit('/schedule')
      .wait('@routeActions');

    cy
      .get('.schedule-list__table')
      .should('contain', 'No Scheduled Actions');

    cy
      .get('[data-select-all-region]')
      .find('button')
      .should('be.disabled');
  });
});
