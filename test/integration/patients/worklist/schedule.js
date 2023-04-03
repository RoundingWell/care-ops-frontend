import _ from 'underscore';
import dayjs from 'dayjs';
import { NIL as NIL_UUID } from 'uuid';

import formatDate from 'helpers/format-date';
import { testDate, testDateAdd, testDateSubtract } from 'helpers/test-date';

const states = ['22222', '33333'];

const STATE_VERSION = 'v4';

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
          due_time: '10:30:00',
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
      .should('contain', '10:30 AM')
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
      .get('.app-frame__pop-region')
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
      .should('contain', formatDate(dayjs(testDateSubtract(1, 'week')).endOf('week'), 'MM/DD/YYYY'));

    cy.clock().invoke('restore');
  });

  specify('filters sidebar', function() {
    localStorage.setItem(`schedule_11111_11111-${ STATE_VERSION }`, JSON.stringify({
      filters: {
        insurance: 'Medicare',
      },
      states: ['22222', '33333'],
    }));

    cy
      .routeDirectories(fx => {
        fx.data = [
          {
            attributes: {
              name: 'Team',
              slug: 'team',
              value: [
                'Coordinator',
                'Nurse',
              ],
            },
          },
          {
            attributes: {
              name: 'Insurance Plans',
              slug: 'insurance',
              value: [
                'BCBS PPO 100',
                'Medicare',
              ],
            },
          },
          {
            attributes: {
              name: 'ACO',
              slug: 'aco',
              value: [
                'Basic',
                'Premier',
              ],
            },
          },
        ];

        return fx;
      })
      .routeSettings(fx => {
        fx.data.push({ id: 'custom_filters', attributes: { value: ['team', 'insurance'] } });

        return fx;
      })
      .routeActions()
      .visit('/schedule')
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[@insurance]=Medicare');

    cy
      .get('.list-page__filters')
      .find('[data-filters-region]')
      .find('button')
      .should('contain', '1');

    cy
      .get('.list-page__filters')
      .find('[data-filters-region]')
      .find('button')
      .click();

    cy
      .get('.app-frame__sidebar .sidebar')
      .as('filtersSidebar')
      .find('.sidebar__heading')
      .should('contain', '1');

    cy
      .get('@filtersSidebar')
      .find('.js-clear-filters')
      .should('not.be.disabled');

    cy
      .get('@filtersSidebar')
      .find('[data-filter-button]')
      .should('have.length', 2)
      .first()
      .get('.sidebar__label')
      .should('contain', 'Insurance Plans')
      .get('[data-filter-button')
      .should('contain', 'Medicare');

    cy
      .get('@filtersSidebar')
      .find('[data-filter-button]')
      .eq(1)
      .get('.sidebar__label')
      .should('contain', 'Team');

    cy
      .get('@filtersSidebar')
      .find('[data-filter-button]')
      .first()
      .click();

    cy
      .get('.picklist')
      .find('.js-input')
      .should('have.attr', 'placeholder', 'Insurance Plans...');

    cy
      .get('.picklist__item')
      .contains('All')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`schedule_11111_11111-${ STATE_VERSION }`));

        expect(storage.filters.insurance).to.be.null;
      })
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('not.contain', 'filter[@insurance]');

    cy
      .get('.list-page__filters')
      .find('[data-filters-region]')
      .find('button')
      .should('not.contain', '1');

    cy
      .get('@filtersSidebar')
      .find('.sidebar__heading')
      .should('not.contain', '1');

    cy
      .get('@filtersSidebar')
      .find('.js-clear-filters')
      .should('be.disabled');

    cy
      .get('@filtersSidebar')
      .find('[data-filter-button]')
      .first()
      .click();

    cy
      .get('.picklist__item')
      .contains('BCBS PPO 100')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`schedule_11111_11111-${ STATE_VERSION }`));

        expect(storage.filters.insurance).to.equal('BCBS PPO 100');
      })
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[@insurance]=BCBS PPO 100');

    cy
      .get('.list-page__filters')
      .find('[data-filters-region]')
      .find('button')
      .should('contain', '1');

    cy
      .get('@filtersSidebar')
      .find('.sidebar__heading')
      .should('contain', '1');

    cy
      .get('@filtersSidebar')
      .find('.js-clear-filters')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`schedule_11111_11111-${ STATE_VERSION }`));

        expect(storage.filters.insurance).to.be.undefined;
      })
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('not.contain', 'filter[@insurance]');

    cy
      .get('.list-page__filters')
      .find('[data-filters-region]')
      .find('button')
      .should('not.contain', '1')
      .click();

    cy
      .get('@filtersSidebar')
      .find('.sidebar__heading')
      .should('not.contain', '1');

    cy
      .get('@filtersSidebar')
      .find('[data-states-filters-region]')
      .get('.sidebar__heading')
      .should('contain', 'States');

    cy
      .get('@filtersSidebar')
      .find('[data-states-filters-region]')
      .find('.fa-square-check')
      .should('have.length', 2);

    cy
      .get('@filtersSidebar')
      .find('[data-states-filters-region]')
      .should('contain', 'To Do')
      .should('contain', 'In Progress');

    cy
      .get('@filtersSidebar')
      .find('[data-states-filters-region]')
      .find('[data-check-region]')
      .first()
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`schedule_11111_11111-${ STATE_VERSION }`));

        expect(storage.states).to.deep.equal(['33333']);
      })
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[state]=33333')
      .should('not.contain', 'filter[state]=22222');

    cy
      .get('.list-page__filters')
      .find('[data-filters-region]')
      .find('button')
      .should('contain', '1');

    cy
      .get('@filtersSidebar')
      .find('.sidebar__heading')
      .should('contain', '1');

    cy
      .get('@filtersSidebar')
      .find('[data-states-filters-region]')
      .find('[data-check-region]')
      .eq(1)
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`schedule_11111_11111-${ STATE_VERSION }`));

        expect(storage.states).to.deep.equal([]);
      })
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', `filter[state]=${ NIL_UUID }`);

    cy
      .get('.list-page__filters')
      .find('[data-filters-region]')
      .find('button')
      .should('contain', '1');

    cy
      .get('@filtersSidebar')
      .find('.sidebar__heading')
      .should('contain', '1');

    cy
      .get('@filtersSidebar')
      .find('[data-filter-button]')
      .first()
      .click();

    cy
      .get('.picklist__item')
      .contains('BCBS PPO 100')
      .click()
      .wait('@routeActions');

    cy
      .get('.list-page__filters')
      .find('[data-filters-region]')
      .find('button')
      .should('contain', '2');

    cy
      .get('@filtersSidebar')
      .find('.sidebar__heading')
      .should('contain', '2');

    cy
      .get('@filtersSidebar')
      .find('.js-clear-filters')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`schedule_11111_11111-${ STATE_VERSION }`));

        expect(storage.states).to.deep.equal(['22222', '33333']);
      })
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[state]=22222,33333');

    cy
      .get('.list-page__filters')
      .find('[data-filters-region]')
      .find('button')
      .should('not.contain', '2');

    cy
      .get('@filtersSidebar')
      .find('.sidebar__heading')
      .should('not.contain', '2');

    cy
      .get('@filtersSidebar')
      .find('.js-close')
      .click();

    cy
      .get('@filtersSidebar')
      .should('not.exist');

    cy
      .get('.list-page__filters')
      .find('[data-filters-region]')
      .find('button')
      .click();

    cy
      .get('[data-select-all-region]')
      .click();

    cy
      .get('@filtersSidebar')
      .find('.js-close')
      .click();

    cy
      .get('@filtersSidebar')
      .should('not.exist');

    cy
      .get('[data-filters-region]')
      .find('.js-cancel')
      .click();

    cy
      .get('.list-page__filters')
      .find('[data-filters-region]')
      .find('button')
      .click();

    cy
      .get('@filtersSidebar')
      .should('exist');
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
      .should('not.exist');
  });

  specify('reduced schedule clinician', function() {
    cy
      .routesForPatientDashboard()
      .routeCurrentClinician(fx => {
        fx.data.id = '123456';
        fx.data.attributes.enabled = true;
        fx.data.relationships.role.data.id = '44444';
        return fx;
      })
      .routeActions(fx => {
        fx.data[0].attributes = {
          name: 'Test Action',
          due_date: testDate(),
          due_time: null,
        };
        fx.data[0].id = '1';
        fx.data[0].relationships.patient.data.id = '1';
        fx.data[0].relationships.form = { data: { id: '1' } };
        fx.data[0].relationships.state.data.id = states[0];

        fx.data[1].attributes = {
          name: 'Test Flow Action',
          due_date: testDateAdd(1),
          due_time: null,
        };
        fx.data[1].id = '2';
        fx.data[1].relationships.patient.data.id = '1';
        fx.data[1].relationships.flow = { data: { id: '1' } };
        fx.data[1].relationships.state.data.id = states[0];

        fx.data[2].attributes = {
          name: 'Action With No Due Date',
          due_date: null,
          due_time: null,
        };
        fx.data[2].id = '3';
        fx.data[2].relationships.patient.data.id = '1';
        fx.data[2].relationships.state.data.id = states[0];

        fx.data = fx.data.slice(0, 3);

        fx.included.push(
          {
            id: '1',
            type: 'patients',
            attributes: _.extend(_.sample(this.fxPatients), {
              first_name: 'Test',
              last_name: 'Patient',
            }),
          },
          {
            id: '1',
            type: 'flows',
            attributes: _.extend(_.sample(this.fxFlows), {
              name: 'Complex Care Management',
            }),
          },
        );

        return fx;
      })
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.relationships.patient.data.id = '1';
        fx.data.relationships.state.data.id = states[0];
        fx.data.relationships.form = { data: { id: '11111' } };

        return fx;
      })
      .routePatientByAction()
      .routeFormByAction()
      .visit('/')
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[clinician]=123456')
      .should('contain', 'filter[state]=22222,33333');

    cy
      .url()
      .should('contain', 'schedule');

    cy
      .get('[data-nav-content-region]')
      .find('[data-worklists-region]')
      .as('worklists');

    cy
      .get('@worklists')
      .find('.app-nav__link')
      .first()
      .should('contain', 'Schedule')
      .should('have.class', 'is-selected');

    cy
      .get('@worklists')
      .find('.app-nav__link')
      .should('have.length', 1);

    cy
      .get('[data-owner-filter-region]')
      .should('not.exist');

    cy
      .get('[data-select-all-region]')
      .find('.button--checkbox')
      .should('not.exist');

    cy
      .get('[data-filters-region]')
      .find('button')
      .should('not.exist');

    cy
      .get('[data-date-filter-region]')
      .find('div')
      .should('not.exist');

    cy
      .get('.list-page__header')
      .find('[data-search-region] .js-input:not([disabled])')
      .as('listSearch')
      .focus()
      .type('abc');

    cy
      .get('.schedule-list__table')
      .as('scheduleList')
      .find('.table-empty-list')
      .should('contain', 'No results match your Find in List search');

    cy
      .get('@listSearch')
      .next()
      .click();

    cy
      .get('@scheduleList')
      .find('.schedule-list__list-row')
      .should('have.length', 2);

    cy
      .get('@scheduleList')
      .find('.schedule-list__list-row')
      .first()
      .find('.schedule-list__day-list-row .js-select')
      .should('not.exist');

    cy
      .get('@scheduleList')
      .find('.schedule-list__list-row')
      .first()
      .find('.schedule-list__day-list-row')
      .should('have.class', 'is-reduced')
      .click();

    cy
      .url()
      .should('contain', 'schedule');

    cy
      .get('@scheduleList')
      .find('.schedule-list__list-row')
      .first()
      .find('.schedule-list__patient-name')
      .should('have.class', 'is-reduced')
      .should('not.have.class', 'js-patient')
      .click();

    cy
      .url()
      .should('contain', 'schedule');

    cy
      .get('@scheduleList')
      .find('.schedule-list__list-row')
      .first()
      .find('.schedule-list__day-list-row')
      .should('have.class', 'is-reduced')
      .contains('Test Action')
      .click();

    cy
      .url()
      .should('contain', 'schedule');

    cy
      .get('@scheduleList')
      .find('.schedule-list__list-row')
      .first()
      .find('.schedule-list__day-list-row')
      .find('.js-form')
      .click();

    cy
      .url()
      .should('contain', 'patient-action/1/form/1')
      .go('back');

    cy
      .get('@scheduleList')
      .find('.schedule-list__list-row')
      .eq(1)
      .find('.schedule-list__day-list-row')
      .contains('Test Flow Action')
      .click();

    cy
      .url()
      .should('contain', 'schedule');

    cy
      .routePatient(fx => {
        fx.data.id = '1';
        fx.data.attributes.first_name = 'First';
        fx.data.attributes.last_name = 'Last';

        return fx;
      })
      .navigate('/patient/dashboard/1');

    cy
      .get('.patient__context-trail')
      .should('contain', 'First Last');

    cy
      .routeAction(fx => {
        fx.data.id = '1';
        fx.data.attributes.name = 'Test Action';
        fx.data.relationships.flow = { data: { id: '1' } };

        return fx;
      })
      .routePatientByAction()
      .navigate('/patient/1/action/1');

    cy
      .get('.patient__context-trail')
      .should('contain', 'First Last');

    cy
      .routeFlow()
      .routeFlowActions()
      .routePatientByFlow()
      .navigate('/flow/1/action/1');

    cy
      .get('.sidebar')
      .find('[data-name-region] .action-sidebar__name')
      .should('contain', 'Test Action');

    cy
      .navigate('/schedule');

    cy
      .get('.list-page__header')
      .find('[data-search-region] .js-input:disabled');

    cy
      .wait('@routeActions');

    cy
      .get('.list-page__header')
      .find('[data-search-region] .js-input:not([disabled])');
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
      selectedActions: [{ '1': true }, { '4444': true }],
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
      .route({
        status: 204,
        method: 'PATCH',
        url: '/api/actions/*',
        response: {},
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
      .route({
        status: 204,
        method: 'DELETE',
        url: '/api/actions/*',
        response: {},
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
      .get('.list-page__header')
      .find('[data-search-region] .js-input:disabled')
      .should('have.attr', 'placeholder', 'Find in List...');

    cy
      .wait('@routeActions');

    cy
      .get('.list-page__header')
      .find('[data-search-region] .js-input:not([disabled])')
      .as('listSearch')
      .focus()
      .type('abc')
      .next()
      .should('have.class', 'js-clear');

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
      .get('@scheduleList')
      .find('.schedule-list__day-list-row')
      .should('have.length', 20);

    cy
      .get('@listSearch')
      .type('Test');

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
      .get('@listSearch')
      .next()
      .click();

    cy
      .get('@listSearch')
      .type('abc');

    cy
      .get('[data-date-filter-region]')
      .find('.js-prev')
      .click();

    cy
      .get('@listSearch')
      .should('have.attr', 'placeholder', 'Find in List...');

    cy
      .wait('@routeActions');

    cy
      .get('@scheduleList')
      .find('.schedule-list__day-list-row')
      .should('have.length', 20);

    cy
      .get('[data-nav-content-region]')
      .find('[data-worklists-region]')
      .find('.app-nav__link')
      .contains('Owned By')
      .click()
      .wait('@routeActions');

    cy
      .navigate('/schedule');

    cy
      .intercept('GET', '/api/action?*', { delay: 100, body: { data: [] } });

    cy
      .get('.list-page__header')
      .find('[data-search-region] .js-input:disabled');
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
      .find('[data-search-region] .js-input:not([disabled])')
      .focus()
      .type('abcd');

    cy
      .get('.list-page__header')
      .find('[data-search-region] .js-input:not([disabled])')
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
});
