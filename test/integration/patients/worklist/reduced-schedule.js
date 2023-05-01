import _ from 'underscore';
import { NIL as NIL_UUID } from 'uuid';

import { testDate, testDateAdd } from 'helpers/test-date';

const states = ['22222', '33333'];

const STATE_VERSION = 'v4';

context('reduced schedule page', function() {
  specify('display schedule', function() {
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
      .should('not.exist');

    cy
      .get('[data-filters-region]')
      .find('button')
      .should('exist');

    cy
      .get('[data-date-filter-region]')
      .find('div')
      .should('not.exist');

    cy
      .get('[data-count-region]')
      .should('contain', '2 Actions');

    cy
      .get('.schedule-list__table')
      .as('scheduleList')
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
  });

  specify('maximum list count reached', function() {
    cy
      .routesForPatientDashboard()
      .routeCurrentClinician(fx => {
        fx.data.id = '123456';
        fx.data.attributes.enabled = true;
        fx.data.relationships.role.data.id = '44444';
        return fx;
      })
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

        return fx;
      })
      .visit('/')
      .wait('@routeActions');

    cy
      .get('[data-count-region]')
      .should('contain', 'Showing 50 of many Actions.')
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
      .should('contain', 'Showing 50 of many Actions.')
      .should('contain', 'Try narrowing your filters.');

    cy
      .get('@listSearch')
      .next()
      .click()
      .prev()
      .type('abcd');

    cy
      .get('[data-count-region] div')
      .should('be.empty');
  });

  specify('filters sidebar', function() {
    localStorage.setItem(`reduced-schedule_11111_11111-${ STATE_VERSION }`, JSON.stringify({
      filters: {
        insurance: 'Medicare',
      },
      states: ['22222', '33333'],
    }));

    cy
      .routesForPatientDashboard()
      .routeCurrentClinician(fx => {
        fx.data.id = '11111';
        fx.data.attributes.enabled = true;
        fx.data.relationships.role.data.id = '44444';
        return fx;
      })
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
      .routeAction()
      .routePatientByAction()
      .routeFormByAction()
      .visit('/')
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[clinician]=11111')
      .should('contain', 'filter[@insurance]=Medicare')
      .should('contain', 'filter[state]=22222,33333');

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
      .should('contain', 'Team')
      .get('[data-filter-button')
      .should('contain', 'All');

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
        const storage = JSON.parse(localStorage.getItem(`reduced-schedule_11111_11111-${ STATE_VERSION }`));

        expect(storage.filters.insurance).to.be.null;
      })
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[clinician]=11111')
      .should('not.contain', 'filter[@insurance]')
      .should('contain', 'filter[state]=22222,33333');

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
        const storage = JSON.parse(localStorage.getItem(`reduced-schedule_11111_11111-${ STATE_VERSION }`));

        expect(storage.filters.insurance).to.equal('BCBS PPO 100');
      })
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[clinician]=11111')
      .should('contain', 'filter[@insurance]=BCBS PPO 100')
      .should('contain', 'filter[state]=22222,33333');

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
        const storage = JSON.parse(localStorage.getItem(`reduced-schedule_11111_11111-${ STATE_VERSION }`));

        expect(storage.filters.insurance).to.be.undefined;
      })
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[clinician]=11111')
      .should('not.contain', 'filter[@insurance]')
      .should('contain', 'filter[state]=22222,33333');

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
      .should('contain', 'To Do')
      .should('contain', 'In Progress')
      .should('contain', 'Done')
      .should('contain', 'Unable to Complete')
      .should('contain', 'THMG Transfered');

    cy
      .get('@filtersSidebar')
      .find('[data-states-filters-region]')
      .find('.fa-square-check')
      .should('have.length', 2);

    cy
      .get('@filtersSidebar')
      .find('[data-states-filters-region]')
      .find('[data-check-region]')
      .first()
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`reduced-schedule_11111_11111-${ STATE_VERSION }`));

        expect(storage.states).to.deep.equal(['33333']);
      })
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[clinician]=11111')
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
        const storage = JSON.parse(localStorage.getItem(`reduced-schedule_11111_11111-${ STATE_VERSION }`));

        expect(storage.states).to.deep.equal([]);
      })
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[clinician]=11111')
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
        const storage = JSON.parse(localStorage.getItem(`reduced-schedule_11111_11111-${ STATE_VERSION }`));

        expect(storage.states).to.deep.equal(['22222', '33333']);
      })
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[clinician]=11111')
      .should('contain', 'filter[state]=22222,33333')
      .should('not.contain', 'filter[@insurance]');

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
  });

  specify('find in list', function() {
    cy
      .routeCurrentClinician(fx => {
        fx.data.id = '123456';
        fx.data.attributes.enabled = true;
        fx.data.relationships.role.data.id = '44444';
        return fx;
      })
      .routeActions(fx => {
        fx.data[0].attributes = {
          name: 'First Action',
          due_date: testDate(),
          due_time: '06:45:00',
        };
        fx.data[0].relationships.patient.data.id = '1';

        _.each(fx.data.slice(2, 20), (action, idx) => {
          if (idx % 2) action.relationships.patient.data.id = '1';
          action.attributes.due_date = testDateAdd(idx + 1);
        });

        fx.included.push(
          {
            id: '1',
            type: 'patients',
            attributes: _.extend(_.sample(this.fxPatients), {
              first_name: 'Test',
              last_name: 'Patient',
            }),
          },
        );

        return fx;
      }, 100)
      .routeDashboards()
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
      .get('.schedule-list__table')
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
      .should('contain', '10 Actions');

    cy
      .get('@scheduleList')
      .find('.schedule-list__day-list-row')
      .should('have.length', 10);

    cy
      .get('.list-page__filters')
      .find('[data-filters-region]')
      .find('button')
      .click();

    cy
      .get('.app-frame__sidebar .sidebar')
      .find('[data-states-filters-region]')
      .find('[data-check-region]')
      .eq(2)
      .click();

    cy
      .wait('@routeActions');

    cy
      .get('.app-frame__sidebar .sidebar')
      .find('.js-close')
      .click();

    cy
      .get('@listSearch')
      .should('have.attr', 'value', 'Test');

    cy
      .get('.app-nav')
      .find('.app-nav__bottom')
      .contains('Dashboards')
      .click()
      .wait('@routeDashboards');

    cy
      .get('[data-nav-content-region]')
      .find('[data-worklists-region]')
      .find('.app-nav__link')
      .contains('Schedule')
      .click()
      .wait('@routeActions');

    cy
      .get('@listSearch')
      .should('have.attr', 'value', 'Test');

    cy
      .get('.list-page__header')
      .find('[data-search-region] .list-search__container')
      .should('have.class', 'is-applied');
  });
});
