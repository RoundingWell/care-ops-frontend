import _ from 'underscore';
import dayjs from 'dayjs';

import formatDate from 'helpers/format-date';
import { testDate, testDateAdd } from 'helpers/test-date';

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
    const testTime = dayjs().hour(10).utc().valueOf();
    const today = dayjs(testTime);
    let dayIncrement = 0;

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
      .routeActions(fx => {
        _.each(fx.data, (action, idx) => {
          action.attributes.due_date = testDateAdd(dayIncrement);

          if (idx === 0) {
            action.attributes.due_time = null;
          }

          action.relationships.state.data.id = idx % 2 === 0 ? states[0] : states[1];

          if (idx !== 0 && idx % 4 === 0) dayIncrement++;
        });
        return fx;
      })
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
  });
});
