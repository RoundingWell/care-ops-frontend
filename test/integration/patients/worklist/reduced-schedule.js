import _ from 'underscore';

import { testDate, testDateAdd } from 'helpers/test-date';

const states = ['22222', '33333'];

context('reduced schedule page', function() {
  specify('display schedule', function() {
    cy
      .routesForPatientAction()
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
      .routeFormDefinition()
      .routeLatestFormResponse()
      .visit()
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
      .should('be.empty');

    cy
      .get('[data-select-all-region]')
      .should('not.exist');

    cy
      .get('[data-filters-region]')
      .find('button')
      .should('exist');

    cy
      .get('[data-date-filter-region]')
      .should('be.empty');

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
      .navigate('/flow/1/action/1')
      .wait('@routeFlow')
      .wait('@routeFlowActions')
      .wait('@routePatientByFlow')
      .wait('@routeAction')
      .wait('@routePatientField');

    cy
      .get('.sidebar')
      .find('.action-sidebar__name')
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

        fx.meta = {
          actions: {
            total: 1000,
          },
        };

        return fx;
      })
      .visit()
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
      .invoke('val')
      .should('equal', 'Test');

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
