import _ from 'underscore';
import dayjs from 'dayjs';
import { NIL as NIL_UUID } from 'uuid';

import formatDate from 'helpers/format-date';
import { testTs, testTsSubtract } from 'helpers/test-timestamp';
import { testDate, testDateAdd, testDateSubtract } from 'helpers/test-date';
import { getResource } from 'helpers/json-api';

const STATE_VERSION = 'v5';

context('worklist page', function() {
  specify('flow list', function() {
    localStorage.setItem(`owned-by_11111_11111-${ STATE_VERSION }`, JSON.stringify({
      id: 'owned-by',
      actionsSortId: 'sortUpdateDesc',
      flowsSortId: 'sortUpdateDesc',
      clinicianId: '11111',
      filters: {},
      actionsSelected: {},
      flowsSelected: {
        '1': true,
      },
    }));

    cy
      .routesForPatientAction()
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
                type: 'teams',
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
            type: 'teams',
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
                type: 'teams',
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
        });

        return fx;
      })
      .routePatient(fx => {
        fx.data.id = '1';
        return fx;
      })
      .routeActions()
      .routeFlow()
      .routeFlowActions()
      .routePatientByFlow()
      .routePatientField()
      .visit('/worklist/owned-by')
      .wait('@routeActions');

    cy
      .get('.worklist-list__toggle')
      .contains('Flows')
      .click()
      .wait('@routeFlows');

    cy
      .get('[data-filters-region]')
      .as('filterRegion')
      .find('.js-bulk-edit')
      .should('contain', 'Edit 1 Flow');

    cy
      .get('[data-count-region]')
      .should('contain', '3 Flows');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .as('firstRow')
      .should('have.class', 'is-selected')
      .find('.js-select')
      .click();

    cy
      .get('@firstRow')
      .find('.js-select')
      .click('top');

    cy
      .get('[data-select-all-region] button:enabled')
      .click();

    cy
      .get('.app-frame__content')
      .find('.table-list__item.is-selected')
      .should('have.length', 3);

    cy
      .get('[data-select-all-region] button:enabled')
      .click();

    cy
      .get('@firstRow')
      .find('.js-select')
      .click('top');

    cy
      .get('[data-select-all-region] button:enabled')
      .click();

    cy
      .get('@firstRow')
      .find('.js-select')
      .click('top');

    cy
      .get('[data-select-all-region] button:enabled')
      .should('not.be.checked')
      .parent()
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
      .contains('Actions')
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
      .intercept('PATCH', '/api/flows/1', {
        statusCode: 204,
        body: {},
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
      .find('.fa-circle-exclamation')
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
      .should('contain', 'Workspace One');

    cy
      .get('.picklist')
      .contains('Nurse')
      .click();

    cy
      .wait('@routePatchFlow')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.owner.data.id).to.equal('22222');
        expect(data.relationships.owner.data.type).to.equal('teams');
      });

    cy
      .get('@firstRow')
      .click('top')
      .wait('@routeFlow')
      .wait('@routePatientByFlow')
      .wait('@routeFlowActions');

    cy
      .url()
      .should('contain', 'flow/1');

    cy
      .go('back');

    cy
      .get('@firstRow')
      .contains('Test Patient')
      .click();

    cy
      .url()
      .should('contain', 'patient/dashboard/1')
      .wait('@routePatient');

    cy
      .go('back')
      .wait('@routeFlows');

    cy
      .get('.worklist-list__toggle')
      .contains('Actions')
      .click()
      .wait('@routeActions');

    cy
      .get('.worklist-list__toggle')
      .contains('Flows')
      .click()
      .wait('@routeFlows');
  });

  specify('done flow list', function() {
    cy
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
        });

        return fx;
      })
      .routeActions()
      .routeFlow()
      .routeFlowActions()
      .routePatientByFlow()
      .visit('/worklist/done-last-thirty-days')
      .wait('@routeActions');


    cy
      .get('.worklist-list__toggle')
      .contains('Flows')
      .click()
      .wait('@routeFlows')
      .itsUrl()
      .its('search')
      .should('contain', `filter[updated_at]=${ dayjs(testDate()).startOf('day').subtract(30, 'days').format() }`)
      .should('contain', 'filter[state]=55555,66666,77777');

    cy
      .intercept('PATCH', '/api/flows/*', {
        statusCode: 204,
        body: {},
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
    const testTime = dayjs(testDate()).hour(12).valueOf();
    localStorage.setItem(`owned-by_11111_11111-${ STATE_VERSION }`, JSON.stringify({
      id: 'owned-by',
      actionsSortId: 'sortUpdateDesc',
      flowsSortId: 'sortUpdateDesc',
      clinicianId: '11111',
      filters: {},
      actionsSelected: {
        '1': true,
      },
      flowsSelected: {},
    }));

    const actions = [
      {
        id: '1',
        type: 'actions',
        attributes: {
          name: 'First In List',
          details: 'Like the legend of the phoenix All ends with beginnings What keeps the planet spinning The force from the beginning Look We\'ve come too far To give up who we are So let\'s raise the bar And our cups to the stars',
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
              type: 'teams',
            },
          },
          state: { data: { id: '22222' } },
          patient: { data: { id: '1' } },
          form: { data: { id: '11111' } },
          flow: { data: { id: '1' } },
          files: { data: [{ id: '1' }] },
        },
      },
      {
        id: '3',
        type: 'actions',
        attributes: {
          name: 'Last In List',
          details: 'Details gonna detail',
          due_date: testDateAdd(5),
          updated_at: testTsSubtract(2),
        },
        relationships: {
          owner: {
            data: {
              id: '11111',
              type: 'teams',
            },
          },
          state: { data: { id: '55555' } },
          patient: { data: { id: '1' } },
          form: { data: null },
          flow: { data: null },
        },
      },
      {
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
              type: 'teams',
            },
          },
          state: { data: { id: '22222' } },
          patient: { data: { id: '1' } },
          form: { data: { id: '1' } },
        },
      },
    ];

    cy
      .fixture('collections/flows').as('fxFlows');

    cy
      .routesForPatientAction()
      .routeActions(fx => {
        const flowInclude = {
          id: '1',
          type: 'flows',
          attributes: _.extend(_.sample(this.fxFlows), {
            name: 'Test Flow',
            id: '1',
          }),
        };

        fx.data = actions;

        fx.included.push({
          id: '1',
          type: 'patients',
          attributes: {
            first_name: 'Test',
            last_name: 'Patient',
          },
        });

        fx.included.push(flowInclude);

        return fx;
      })
      .routePatient(fx => {
        fx.data.id = '1';
        return fx;
      })
      .routeAction(fx => {
        fx.data = actions[0];
        return fx;
      })
      .routeFormByAction()
      .visit('/worklist/owned-by');

    cy.clock(testTime, ['Date']);

    cy
      .get('[data-filters-region]')
      .as('filterRegion')
      .find('.js-bulk-edit')
      .should('contain', 'Edit 1 Action');

    cy
      .get('[data-count-region]')
      .should('contain', '3 Actions');

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
      .find('.fa-square-check')
      .click();

    cy
      .get('@firstRow')
      .should('not.have.class', 'is-selected')
      .find('.js-select')
      .find('.fa-square');

    cy
      .get('.worklist-list__toggle')
      .contains('Actions')
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
      .routeFlowActions()
      .routePatientByFlow();

    cy
      .get('@firstRow')
      .click('top')
      .wait('@routeFlow')
      .wait('@routePatientByFlow')
      .wait('@routeFlowActions');

    cy
      .url()
      .should('contain', 'flow/1/action/1');

    cy
      .go('back')
      .wait('@routeActions');

    cy
      .routeAction(fx => {
        fx.data = actions[2];
        return fx;
      });

    cy
      .get('@firstRow')
      .next()
      .as('secondRow')
      .click('top');

    cy
      .url()
      .should('contain', 'patient/1/action/2')
      .wait('@routeAction');

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
      .wait('@routePatient');

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
      .routeAction(fx => {
        fx.data = actions[1];
        return fx;
      });

    cy
      .get('@secondRow')
      .next()
      .click('top')
      .wait('@routePatientActions');

    cy
      .get('.patient__layout')
      .find('.patient__tab--selected')
      .contains('Archive');

    cy
      .go('back')
      .wait('@routeActions');

    cy
      .intercept('PATCH', '/api/actions/1', {
        statusCode: 204,
        body: {},
      })
      .as('routePatchAction');

    cy
      .get('@firstRow')
      .find('.fa-circle-exclamation')
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
      .should('contain', 'Workspace One');

    cy
      .get('.picklist')
      .contains('Nurse')
      .click();

    cy
      .wait('@routePatchAction')
      .its('request.body')
      .should(({ data }) => {
        expect(data.relationships.owner.data.id).to.equal('22222');
        expect(data.relationships.owner.data.type).to.equal('teams');
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
      .get('@firstRow')
      .find('.fa-paperclip')
      .should('exist');

    cy
      .get('@secondRow')
      .find('.fa-paperclip')
      .should('not.exist');

    cy
      .get('@secondRow')
      .next()
      .find('.fa-circle-check')
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
      .get('.app-frame__content')
      .find('.table-list__item')
      .last()
      .find('[data-details-region]')
      .trigger('pointerover');

    cy
      .get('.tooltip')
      .should('contain', 'Details gonna detail');

    cy
      .get('@secondRow')
      .find('[data-details-region]')
      .should('be.empty');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .find('[data-details-region]')
      .trigger('pointerover');

    cy
      .get('.tooltip')
      .should('contain', 'Test Flow')
      .should('contain', 'First In List')
      .should('contain', 'Like the legend of the phoenix All ends with beginnings What keeps the planet spinning The force from the beginning Look We\'ve come too far...');

    cy
      .routeAction(fx => {
        fx.data = actions[2];
        return fx;
      });

    cy
      .get('@secondRow')
      .find('[data-form-region] button')
      .click()
      .wait('@routeFormByAction');

    cy
      .url()
      .should('contain', 'patient-action/2/form/1');

    cy
      .go('back');

    cy.clock().invoke('restore');
  });

  specify('maximum list count reached', function() {
    localStorage.setItem(`owned-by_11111_11111-${ STATE_VERSION }`, JSON.stringify({
      id: 'owned-by',
      actionsSortId: 'sortUpdateDesc',
      flowsSortId: 'sortUpdateDesc',
      clinicianId: '11111',
      filters: {},
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
            updated_at: testTs(),
            created_at: testTs(),
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
      .routeFlows(fx => {
        const flow = _.sample(fx.data);

        fx.data = _.times(50, n => {
          const clone = _.clone(flow);

          const flowName = n === 0 ? 'First Flow' : `Flow ${ n + 1 }`;
          const patientId = n % 2 ? '1' : '2';

          clone.id = `${ n }`;
          clone.attributes = {
            name: flowName,
            updated_at: testTs(),
            created_at: testTs(),
          };

          clone.relationships = {
            owner: {
              data: {
                id: '11111',
                type: 'teams',
              },
            },
            state: {
              data: { id: '22222' },
            },
            patient: {
              data: { id: patientId },
            },
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
          flows: {
            total: 1000,
          },
        };

        return fx;
      })
      .visit('/worklist/owned-by')
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
      .click();

    cy
      .get('.worklist-list__toggle')
      .contains('Flows')
      .click()
      .wait('@routeFlows');

    cy
      .get('[data-count-region]')
      .should('contain', 'Showing 50 of 1,000 Flows.')
      .should('contain', 'Try narrowing your filters.');

    cy
      .get('.list-page__header')
      .find('[data-search-region] .js-input')
      .as('listSearch')
      .type('First Flow');

    cy
      .get('[data-count-region]')
      .should('contain', 'Showing 1 of 50 Flows.')
      .should('contain', 'Try narrowing your filters.');

    cy
      .get('@listSearch')
      .next()
      .click()
      .prev()
      .type('Test Patient');

    cy
      .get('[data-count-region]')
      .should('contain', 'Showing 25 of 50 Flows.')
      .should('contain', 'Try narrowing your filters.');

    cy
      .get('@listSearch')
      .next()
      .click()
      .prev()
      .type('Flow');

    cy
      .get('[data-count-region]')
      .should('contain', 'Showing 50 of 1,000 Flows.')
      .should('contain', 'Try narrowing your filters.');
  });

  specify('non-existent worklist', function() {
    cy
      .visit('/worklist/test')
      .url()
      .should('contain', '404');
  });

  specify('clinician filtering', function() {
    cy
      .routeWorkspaceClinicians(fx => {
        fx.data = _.first(fx.data, 6);

        _.each(fx.data, clinician => {
          clinician.relationships.team = { data: { id: '11111' } };
          clinician.relationships.role = { data: { id: '33333' } };
        });

        // NOTE: fx.data[0] is the current clinician

        fx.data[1].id = 'test-clinician';
        fx.data[1].attributes.name = 'Test Clinician';

        fx.data[2].id = '1';
        fx.data[2].attributes.name = 'C Clinician';

        fx.data[3].id = '2';
        fx.data[3].attributes.name = 'A Clinician';

        fx.data[4].id = '3';
        fx.data[4].attributes.name = 'B Clinician';

        fx.data[5].attributes.name = 'Admin Clinician';
        fx.data[5].relationships.role = { data: { id: '22222' } };

        return fx;
      })
      .routeFlows()
      .routeFlow()
      .routeFlowActions()
      .routePatientByFlow()
      .routeActions()
      .visit('/worklist/owned-by')
      .wait('@routeActions');

    cy
      .get('.worklist-list__toggle')
      .contains('Flows')
      .click()
      .wait('@routeFlows')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[clinician]=11111')
      .should('contain', 'filter[state]=22222,33333');

    cy
      .get('[data-owner-filter-region]')
      .should('contain', 'Clinician McTester')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__group .js-picklist-item')
      .should('not.contain', 'Admin Clinician');

    cy
      .get('.picklist')
      .find('.picklist__group')
      .contains('Workspace One')
      .parent()
      .find('.js-picklist-item')
      .first()
      .should('contain', 'A Clinician')
      .next()
      .should('contain', 'B Clinician')
      .next()
      .should('contain', 'C Clinician')
      .next()
      .should('contain', 'Clinician McTester')
      .next()
      .should('contain', 'Test Clinician')
      .click();

    cy
      .wait('@routeFlows')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[clinician]=test-clinician')
      .should('contain', 'filter[state]=22222,33333');

    cy
      .get('.list-page__title')
      .should('contain', 'Test Clinician');

    cy
      .get('[data-owner-filter-region]')
      .should('contain', 'Test Clinician')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .first()
      .should('contain', 'Clinician McTester')
      .click();

    cy
      .wait('@routeFlows')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[clinician]=11111')
      .should('contain', 'filter[state]=22222,33333');

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
      .find('button')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('Test Clinician')
      .click();

    cy
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[clinician]=test-clinician');
  });

  specify('owner filtering', function() {
    cy
      .routeWorkspaceClinicians(fx => {
        fx.data = _.first(fx.data, 5);

        _.each(fx.data, clinician => {
          clinician.relationships.role = { data: { id: '33333' } };
        });

        // NOTE: fx.data[0] is the current clinician

        fx.data[1].id = 'test-clinician';
        fx.data[1].attributes.name = 'Test Clinician';
        fx.data[1].relationships.team = { data: { id: '33333' } };

        fx.data[2].id = '1';
        fx.data[2].attributes.name = 'C Clinician';

        fx.data[3].id = '2';
        fx.data[3].attributes.name = 'A Clinician';

        fx.data[4].id = '3';
        fx.data[4].attributes.name = 'B Clinician';

        return fx;
      })
      .routeFlows()
      .routeFlow()
      .routeFlowActions()
      .routePatientByFlow()
      .routeActions()
      .visit('/worklist/new-past-day')
      .wait('@routeActions');

    cy
      .get('.worklist-list__toggle')
      .contains('Flows')
      .click()
      .wait('@routeFlows');

    cy
      .get('[data-owner-filter-region]')
      .find('button')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('Pharmacist')
      .click();

    cy
      .wait('@routeFlows')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[team]=33333');

    cy
      .get('[data-owner-filter-region]')
      .find('button')
      .click();

    cy
      .get('.picklist')
      .find('.js-picklist-item')
      .contains('C Clinician')
      .click();

    cy
      .wait('@routeFlows')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[clinician]=1');

    cy
      .get('[data-owner-toggle-region]')
      .should('be.empty');

    cy
      .get('.app-frame__nav')
      .find('.app-nav__link')
      .contains('Shared By')
      .click()
      .wait('@routeActions');

    cy
      .get('[data-owner-filter-region]')
      .should('contain', 'Nurse')
      .find('button')
      .click();

    cy
      .get('.picklist')
      .find('.picklist__heading')
      .should('contain', 'Filter by Team');

    cy
      .get('[data-owner-toggle-region]')
      .contains('No Owner')
      .should('not.have.class', 'button--blue')
      .click();

    cy
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', `filter[clinician]=${ NIL_UUID }`)
      .should('contain', 'filter[team]=22222');

    cy
      .get('[data-owner-toggle-region]')
      .contains('No Owner')
      .should('have.class', 'button--blue')
      .click();

    cy
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('not.contain', `filter[clinician]=${ NIL_UUID }`)
      .should('contain', 'filter[team]=22222');
  });

  specify('date filtering', function() {
    const testTime = dayjs(testDate()).hour(12).valueOf();
    const filterDate = testDateSubtract(1);

    localStorage.setItem(`owned-by_11111_11111-${ STATE_VERSION }`, JSON.stringify({
      id: 'owned-by',
      actionsSortId: 'sortUpdateDesc',
      flowsSortId: 'sortUpdateDesc',
      clinicianId: '11111',
      filters: {},
      actionsDateFilters: {
        selectedDate: filterDate,
        dateType: 'created_at',
      },
      actionsSelected: {
        '1': true,
      },
      flowsSelected: {},
      listType: 'flows',
    }));

    cy.clock(testTime, ['Date']);

    cy
      .routeFlows()
      .routeActions()
      .routeFlow()
      .routeFlowActions()
      .routePatientByFlow()
      .visit('/worklist/owned-by')
      .wait('@routeFlows')
      .itsUrl()
      .its('search')
      .should('contain', `filter[created_at]=${ dayjs(testDate()).startOf('month').format() },${ dayjs(testDate()).endOf('month').format() }`);

    cy
      .get('[data-date-filter-region]')
      .should('contain', 'Added:')
      .should('contain', 'This Month')
      .click();

    cy
      .get('[data-date-type-region]')
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
      .trigger('pointerover');

    cy
      .get('.tooltip')
      .should('contain', formatDate(testDateSubtract(2), 'MM/DD/YYYY'));

    cy
      .get('[data-date-filter-region]')
      .find('.js-prev')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`owned-by_11111_11111-${ STATE_VERSION }`));

        expect(formatDate(storage.actionsDateFilters.selectedDate, 'YYYY-MM-DD')).to.be.equal(testDateSubtract(2));
        expect(storage.actionsDateFilters.relativeDate).to.be.null;
        expect(storage.actionsDateFilters.selectedMonth).to.be.null;
        expect(storage.actionsDateFilters.selectedWeek).to.be.null;
      })
      .wait('@routeActions');

    cy
      .get('[data-date-filter-region]')
      .should('contain', formatDate(testDateSubtract(2), 'MM/DD/YYYY'))
      .find('.js-next')
      .trigger('pointerover');

    cy
      .get('.tooltip')
      .should('contain', formatDate(filterDate, 'MM/DD/YYYY'));

    cy
      .get('[data-date-filter-region]')
      .find('.js-next')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`owned-by_11111_11111-${ STATE_VERSION }`));

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
      .get('[data-date-type-region]')
      .contains('Updated')
      .click();

    cy
      .get('.app-frame__pop-region')
      .contains('Last Week')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`owned-by_11111_11111-${ STATE_VERSION }`));

        expect(storage.actionsDateFilters.selectedDate).to.be.null;
        expect(storage.actionsDateFilters.selectedWeek).to.be.null;
        expect(storage.actionsDateFilters.relativeDate).to.equal('lastweek');
        expect(storage.actionsDateFilters.selectedMonth).to.be.null;
      })
      .wait('@routeActions');

    cy
      .get('[data-date-filter-region]')
      .should('contain', 'Last Week')
      .find('.js-next')
      .trigger('pointerover');

    cy
      .get('.tooltip')
      .should('contain', formatDate(dayjs(testDate()).startOf('week'), 'MM/DD/YYYY'))
      .should('contain', formatDate(dayjs(testDate()).endOf('week'), 'MM/DD/YYYY'));

    cy
      .get('[data-date-filter-region]')
      .should('contain', 'Last Week')
      .find('.js-next')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`owned-by_11111_11111-${ STATE_VERSION }`));

        expect(formatDate(storage.actionsDateFilters.selectedWeek, 'YYYY-MM-DD')).to.be.equal(dayjs(testDate()).startOf('week').format('YYYY-MM-DD'));
        expect(storage.actionsDateFilters.selectedDate).to.be.null;
        expect(storage.actionsDateFilters.relativeDate).to.be.null;
        expect(storage.actionsDateFilters.selectedMonth).to.be.null;
      })
      .wait('@routeActions');

    cy
      .get('[data-date-filter-region]')
      .find('.js-next')
      .click()
      .wait('@routeActions');

    cy
      .get('[data-date-filter-region]')
      .find('.js-prev')
      .click()
      .wait('@routeActions');

    cy
      .get('[data-date-filter-region]')
      .contains(`Updated: ${ dayjs(testDate()).startOf('week').format('MM/DD/YYYY') } - ${ dayjs(testDate()).endOf('week').format('MM/DD/YYYY') }`)
      .click();

    cy
      .get('.app-frame__pop-region')
      .contains('Select from calendar')
      .click();

    cy
      .get('.app-frame__pop-region')
      .find('.js-current-month')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`owned-by_11111_11111-${ STATE_VERSION }`));

        expect(storage.actionsDateFilters.relativeDate).to.equal('thismonth');
        expect(storage.actionsDateFilters.selectedDate).to.be.null;
        expect(storage.actionsDateFilters.selectedMonth).to.be.null;
        expect(storage.actionsDateFilters.dateType).to.be.equal('updated_at');
      });

    cy
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', `filter[updated_at]=${ dayjs(testDate()).startOf('month').format() },${ dayjs(testDate()).endOf('month').format() }`);

    cy
      .get('[data-date-filter-region]')
      .should('contain', 'Updated:')
      .should('contain', 'This Month')
      .find('.js-prev')
      .trigger('pointerover');

    cy
      .get('.tooltip')
      .should('contain', formatDate(testDateSubtract(1, 'month'), 'MMM YYYY'));

    cy
      .get('[data-date-filter-region]')
      .find('.js-prev')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`owned-by_11111_11111-${ STATE_VERSION }`));

        expect(formatDate(storage.actionsDateFilters.selectedMonth, 'MMM YYYY')).to.equal(formatDate(testDateSubtract(1, 'month'), 'MMM YYYY'));
        expect(storage.actionsDateFilters.relativeDate).to.be.null;
        expect(storage.actionsDateFilters.selectedDate).to.be.null;
      });

    const lastMonth = testDateSubtract(1, 'month');
    cy
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', `filter[updated_at]=${ dayjs(lastMonth).startOf('month').format() },${ dayjs(lastMonth).endOf('month').format() }`);

    cy
      .get('[data-date-filter-region]')
      .should('contain', formatDate(lastMonth, 'MMM YYYY'))
      .click();

    cy
      .get('.app-frame__pop-region')
      .contains('This Month')
      .click()
      .wait('@routeActions');

    cy
      .get('[data-date-filter-region]')
      .should('contain', 'This Month')
      .find('.js-next')
      .trigger('pointerover');

    cy
      .get('.tooltip')
      .should('contain', formatDate(testDateAdd(1, 'month'), 'MMM YYYY'));

    cy
      .get('[data-date-filter-region]')
      .find('.js-next')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`owned-by_11111_11111-${ STATE_VERSION }`));

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
      .get('.app-frame__pop-region')
      .contains('Due')
      .click();

    cy
      .get('.app-frame__pop-region')
      .contains('Today')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`owned-by_11111_11111-${ STATE_VERSION }`));

        expect(storage.actionsDateFilters.relativeDate).to.equal('today');
        expect(storage.actionsDateFilters.selectedDate).to.be.null;
        expect(storage.actionsDateFilters.selectedMonth).to.be.null;
        expect(storage.actionsDateFilters.dateType).to.equal('due_date');
      });

    cy
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', `filter[due_date]=${ testDate() },${ testDate() }`);

    cy
      .get('[data-date-filter-region]')
      .should('contain', 'Due:')
      .should('contain', 'Today')
      .find('.js-prev')
      .trigger('pointerover');

    cy
      .get('.tooltip')
      .should('contain', formatDate(testDateSubtract(1), 'MM/DD/YYYY'));

    cy
      .get('[data-date-filter-region]')
      .find('.js-prev')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`owned-by_11111_11111-${ STATE_VERSION }`));

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
      .get('.app-frame__pop-region')
      .contains('Added')
      .click();

    cy
      .get('.app-frame__pop-region')
      .contains('Today')
      .click()
      .wait('@routeActions');

    cy
      .get('[data-date-filter-region]')
      .should('contain', 'Added:')
      .should('contain', 'Today')
      .find('.js-next')
      .trigger('pointerover');

    cy
      .get('.tooltip')
      .should('contain', formatDate(testDateAdd(1), 'MM/DD/YYYY'));

    cy
      .get('[data-date-filter-region]')
      .find('.js-next')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`owned-by_11111_11111-${ STATE_VERSION }`));

        expect(formatDate(storage.actionsDateFilters.selectedDate, 'YYYY-MM-DD')).to.equal(formatDate(testDateAdd(1), 'YYYY-MM-DD'));
        expect(storage.actionsDateFilters.relativeDate).to.be.null;
        expect(storage.actionsDateFilters.selectedMonth).to.be.null;
        expect(storage.actionsDateFilters.dateType).to.equal('created_at');
      });

    cy
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', `filter[created_at]=${ dayjs(testDateAdd(1)).startOf('day').format() },${ dayjs(testDateAdd(1)).endOf('day').format() }`);

    cy
      .get('[data-date-filter-region]')
      .should('contain', formatDate(testDateAdd(1), 'MM/DD/YYYY'))
      .click();

    cy
      .get('.app-frame__pop-region')
      .contains('Yesterday')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`owned-by_11111_11111-${ STATE_VERSION }`));

        expect(storage.actionsDateFilters.relativeDate).to.equal('yesterday');
        expect(storage.actionsDateFilters.selectedDate).to.be.null;
        expect(storage.actionsDateFilters.selectedMonth).to.be.null;
      });

    cy
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', `filter[created_at]=${ dayjs(testDateSubtract(1)).startOf('day').format() },${ dayjs(testDateSubtract(1)).endOf('day').format() }`);

    cy
      .get('[data-date-filter-region]')
      .should('contain', 'Yesterday')
      .find('.js-prev')
      .trigger('pointerover');

    cy
      .get('.tooltip')
      .should('contain', formatDate(testDateSubtract(2), 'MM/DD/YYYY'));

    cy
      .get('[data-date-filter-region]')
      .find('.js-prev')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`owned-by_11111_11111-${ STATE_VERSION }`));

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
      .get('.app-frame__pop-region')
      .contains('Yesterday')
      .click()
      .wait('@routeActions');

    cy
      .get('[data-date-filter-region]')
      .should('contain', 'Yesterday')
      .find('.js-next')
      .trigger('pointerover');

    cy
      .get('.tooltip')
      .should('contain', formatDate(testDate(), 'MM/DD/YYYY'));

    cy
      .get('[data-date-filter-region]')
      .find('.js-next')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`owned-by_11111_11111-${ STATE_VERSION }`));

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
      .get('.app-frame__pop-region')
      .contains('Select from calendar')
      .click();

    cy
      .get('.datepicker')
      .find('.js-month')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`owned-by_11111_11111-${ STATE_VERSION }`));

        expect(storage.actionsDateFilters.relativeDate).to.be.null;
        expect(storage.actionsDateFilters.selectedDate).to.be.null;
        expect(formatDate(storage.actionsDateFilters.selectedMonth, 'MMM YYYY')).to.equal(formatDate(testDate(), 'MMM YYYY'));
      });

    cy
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', `filter[created_at]=${ dayjs(testDate()).startOf('month').format() },${ dayjs(testDate()).endOf('month').format() }`);

    cy
      .get('[data-date-filter-region]')
      .find('.js-prev')
      .trigger('pointerover');

    cy
      .get('.tooltip')
      .should('contain', formatDate(testDateSubtract(1, 'month'), 'MMM YYYY'));

    cy
      .get('[data-date-filter-region]')
      .find('.js-prev')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`owned-by_11111_11111-${ STATE_VERSION }`));

        expect(storage.actionsDateFilters.relativeDate).to.be.null;
        expect(storage.actionsDateFilters.selectedDate).to.be.null;
        expect(formatDate(storage.actionsDateFilters.selectedMonth, 'MMM YYYY')).to.equal(formatDate(testDateSubtract(1, 'month'), 'MMM YYYY'));
      })
      .wait('@routeActions');

    cy
      .get('[data-date-filter-region]')
      .should('contain', formatDate(testDateSubtract(1, 'month'), 'MMM YYYY'))
      .find('.js-next')
      .trigger('pointerover');

    cy
      .get('.tooltip')
      .should('contain', formatDate(testDate(), 'MMM YYYY'));

    cy
      .get('[data-date-filter-region]')
      .find('.js-next')
      .click()
      .wait('@routeActions');

    cy
      .get('[data-date-filter-region]')
      .should('contain', formatDate(testDate(), 'MMM YYYY'))
      .find('.js-next')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`owned-by_11111_11111-${ STATE_VERSION }`));

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
      .get('.app-frame__pop-region')
      .contains('Select from calendar')
      .click();

    cy
      .get('.datepicker')
      .find('.js-prev')
      .click();

    cy
      .get('.app-frame__pop-region')
      .contains('Updated')
      .click();

    cy
      .get('.app-frame__pop-region')
      .contains('Updated')
      .should('have.class', 'button--blue');

    cy
      .get('.app-frame__pop-region')
      .contains('Due')
      .click();

    cy
      .get('.app-frame__pop-region')
      .contains('Due')
      .should('have.class', 'button--blue');

    cy
      .get('.app-frame__pop-region')
      .contains('Added')
      .click();

    cy
      .get('.app-frame__pop-region')
      .contains('Added')
      .should('have.class', 'button--blue');

    cy
      .get('.datepicker')
      .find('.is-today')
      .click()
      .wait('@routeActions');

    cy
      .get('.datepicker')
      .should('not.exist');

    cy
      .get('[data-date-filter-region]')
      .should('contain', 'Added:')
      .should('contain', formatDate(testDate(), 'MM/DD/YYYY'))
      .click();

    cy
      .get('.app-frame__pop-region')
      .contains('All Time')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`owned-by_11111_11111-${ STATE_VERSION }`));

        expect(storage.actionsDateFilters.relativeDate).to.equal('alltime');
        expect(storage.actionsDateFilters.selectedDate).to.be.null;
        expect(storage.actionsDateFilters.selectedMonth).to.be.null;
        expect(storage.actionsDateFilters.dateType).to.equal('created_at');
      });

    cy
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('not.contain', 'filter[created_at]');

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

  specify('filters sidebar', function() {
    localStorage.setItem(`owned-by_11111_11111-${ STATE_VERSION }`, JSON.stringify({
      id: 'owned-by',
      filters: {
        insurance: 'Medicare',
      },
      states: ['22222', '33333'],
    }));

    cy
      .routeActions()
      .routeFlow()
      .routeFlowActions()
      .routePatientByFlow()
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
      .visit('/worklist/owned-by')
      .wait('@routeActions')
      .itsUrl()
      .its('search')
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
        const storage = JSON.parse(localStorage.getItem(`owned-by_11111_11111-${ STATE_VERSION }`));

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
        const storage = JSON.parse(localStorage.getItem(`owned-by_11111_11111-${ STATE_VERSION }`));

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
        const storage = JSON.parse(localStorage.getItem(`owned-by_11111_11111-${ STATE_VERSION }`));

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
      .find('.fa-square')
      .should('have.length', 3);

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
      .find('[data-check-region]')
      .first()
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`owned-by_11111_11111-${ STATE_VERSION }`));

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
      .find('.fa-square-check')
      .should('have.length', 1);

    cy
      .get('@filtersSidebar')
      .find('[data-states-filters-region]')
      .find('.fa-square')
      .should('have.length', 4);

    cy
      .get('@filtersSidebar')
      .find('[data-states-filters-region]')
      .find('[data-check-region]')
      .eq(1)
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`owned-by_11111_11111-${ STATE_VERSION }`));

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
      .find('[data-states-filters-region]')
      .find('.fa-square-check')
      .should('have.length', 0);

    cy
      .get('@filtersSidebar')
      .find('[data-states-filters-region]')
      .find('.fa-square')
      .should('have.length', 5);

    cy
      .get('@filtersSidebar')
      .find('[data-states-filters-region]')
      .find('[data-check-region]')
      .eq(1)
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`owned-by_11111_11111-${ STATE_VERSION }`));

        expect(storage.states).to.deep.equal(['33333']);
      })
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[state]=33333');

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
      .find('.fa-square-check')
      .should('have.length', 1);

    cy
      .get('@filtersSidebar')
      .find('[data-states-filters-region]')
      .find('.fa-square')
      .should('have.length', 4);

    cy
      .get('@filtersSidebar')
      .find('.js-clear-filters')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`owned-by_11111_11111-${ STATE_VERSION }`));

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
      .find('[data-states-filters-region]')
      .find('.fa-square-check')
      .should('have.length', 2);

    cy
      .get('@filtersSidebar')
      .find('[data-states-filters-region]')
      .find('.fa-square')
      .should('have.length', 3);

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

  specify('filters sidebar - done states', function() {
    cy
      .routeActions()
      .routeFlow()
      .routeFlowActions()
      .routePatientByFlow()
      .routeDirectories()
      .visit('/worklist/done-last-thirty-days')
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[state]=55555,66666,77777');

    cy
      .get('.list-page__filters')
      .find('[data-filters-region]')
      .find('button')
      .click();

    cy
      .get('.app-frame__sidebar .sidebar')
      .as('filtersSidebar')
      .find('[data-states-filters-region]')
      .find('.fa-square-check')
      .should('have.length', 3);

    cy
      .get('@filtersSidebar')
      .find('[data-states-filters-region]')
      .find('.fa-square')
      .should('have.length', 0);

    cy
      .get('@filtersSidebar')
      .find('[data-states-filters-region]')
      .should('not.contain', 'To Do')
      .should('not.contain', 'In Progress')
      .should('contain', 'Done')
      .should('contain', 'Unable to Complete')
      .should('contain', 'THMG Transfered');

    cy
      .get('@filtersSidebar')
      .find('[data-states-filters-region]')
      .find('[data-check-region]')
      .first()
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`done-last-thirty-days_11111_11111-${ STATE_VERSION }`));

        expect(storage.states).to.deep.equal(['66666', '77777']);
      })
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[state]=66666,77777');

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
      .find('.fa-square-check')
      .should('have.length', 2);

    cy
      .get('@filtersSidebar')
      .find('[data-states-filters-region]')
      .find('.fa-square')
      .should('have.length', 1);

    cy
      .get('@filtersSidebar')
      .find('.js-clear-filters')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`done-last-thirty-days_11111_11111-${ STATE_VERSION }`));

        expect(storage.states).to.deep.equal(['55555', '66666', '77777']);
      })
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[state]=55555,66666,77777');

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
      .find('[data-states-filters-region]')
      .find('.fa-square-check')
      .should('have.length', 3);

    cy
      .get('@filtersSidebar')
      .find('[data-states-filters-region]')
      .find('.fa-square')
      .should('have.length', 0);
  });

  specify('restricted employee', function() {
    cy
      .routeCurrentClinician(fx => {
        fx.data.id = '123456';
        fx.data.attributes.enabled = true;
        fx.data.relationships.role.data.id = '22222';
        return fx;
      })
      .routeActions()
      .visit('/worklist/owned-by')
      .wait('@routeActions');

    cy
      .get('[data-owner-filter-region]')
      .should('be.empty');
  });

  specify('restricted employee -  shared by', function() {
    cy
      .routeCurrentClinician(fx => {
        fx.data.id = '123456';
        fx.data.attributes.enabled = true;
        fx.data.relationships.role.data.id = '22222';
        return fx;
      })
      .routeActions()
      .visit('/worklist/shared-by')
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', `filter[clinician]=${ NIL_UUID }`);

    cy
      .get('[data-owner-filter-region]')
      .find('button');

    cy
      .get('[data-owner-toggle-region]')
      .should('be.empty');
  });

  specify('flow sorting', function() {
    cy
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
      .routeActions()
      .visit('/worklist/shared-by')
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', 'include=patient.patient-fields.foo');

    cy
      .get('.worklist-list__toggle')
      .contains('Flows')
      .click()
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

  specify('flow sorting - patient', function() {
    cy
      .routeFlows(fx => {
        fx.data = _.sample(fx.data, 3);

        fx.data[0].relationships.patient = { data: { id: 'b' } };
        fx.data[1].relationships.patient = { data: { id: 'c' } };
        fx.data[2].relationships.patient = { data: { id: 'a' } };

        fx.included.push({
          id: 'a',
          type: 'patients',
          attributes: {
            first_name: 'APatient',
            last_name: 'AName',
          },
        });

        fx.included.push({
          id: 'b',
          type: 'patients',
          attributes: {
            first_name: 'BPatient',
            last_name: 'AName',
          },
        });

        fx.included.push({
          id: 'c',
          type: 'patients',
          attributes: {
            first_name: 'APatient',
            last_name: 'BName',
          },
        });

        return fx;
      })
      .routeActions()
      .visit('/worklist/shared-by')
      .wait('@routeActions');

    cy
      .get('.worklist-list__toggle')
      .contains('Flows')
      .click()
      .wait('@routeFlows');

    cy
      .get('.worklist-list__filter-sort')
      .click()
      .get('.picklist')
      .contains('Patient Last: A')
      .click();

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .should('contain', 'APatient AName');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .last()
      .should('contain', 'APatient BName');

    cy
      .get('.worklist-list__filter-sort')
      .click()
      .get('.picklist')
      .contains('Patient Last: Z')
      .click();

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .should('contain', 'APatient BName');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .last()
      .should('contain', 'APatient AName');
  });

  specify('flow sorting alphabetical - patient field', function() {
    cy
      .routeFlows(fx => {
        fx.data = _.sample(fx.data, 3);

        fx.data[0].relationships.patient = { data: { id: 'b' } };
        fx.data[1].relationships.patient = { data: { id: 'c' } };
        fx.data[2].relationships.patient = { data: { id: 'a' } };

        fx.included.push({
          id: 'a',
          type: 'patients',
          attributes: {
            first_name: 'Patient',
            last_name: 'Field A',
          },
          relationships: { 'patient-fields': { data: [{ id: '1' }] } },
        });

        fx.included.push({
          id: '1',
          type: 'patient-fields',
          attributes: { value: { value: 'A' }, name: 'foo' },
        });

        fx.included.push({
          id: 'b',
          type: 'patients',
          attributes: {
            first_name: 'Patient',
            last_name: 'Field None',
          },
        });

        fx.included.push({
          id: 'c',
          type: 'patients',
          attributes: {
            first_name: 'Patient',
            last_name: 'Field B',
          },
          relationships: { 'patient-fields': { data: [{ id: '3' }] } },
        });

        fx.included.push({
          id: '3',
          type: 'patient-fields',
          attributes: { value: { value: 'B' }, name: 'foo' },
        });

        return fx;
      })
      .routeActions()
      .visit('/worklist/shared-by')
      .wait('@routeActions');

    cy
      .get('.worklist-list__toggle')
      .contains('Flows')
      .click()
      .wait('@routeFlows');

    cy
      .get('.worklist-list__filter-sort')
      .click()
      .get('.picklist')
      .contains('Foo: Highest - Lowest')
      .click();

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .should('contain', 'Patient Field B');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .last()
      .should('contain', 'Patient Field None');

    cy
      .get('.worklist-list__filter-sort')
      .click()
      .get('.picklist')
      .contains('Foo: Lowest - Highest')
      .click();

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .should('contain', 'Patient Field None');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .last()
      .should('contain', 'Patient Field B');
  });

  specify('flow sorting numerical - patient field', function() {
    cy
      .routeSettings(fx => {
        const sortingSettings = _.find(fx.data, setting => setting.id === 'sorting');
        _.each(sortingSettings.attributes.value, function(sortMethod) {
          sortMethod.sort_type = 'numeric';
        });

        return fx;
      })
      .routeFlows(fx => {
        fx.data = _.sample(fx.data, 3);

        fx.data[0].relationships.patient = { data: { id: '2' } };
        fx.data[1].relationships.patient = { data: { id: '3' } };
        fx.data[2].relationships.patient = { data: { id: '1' } };

        fx.included.push({
          id: '1',
          type: 'patients',
          attributes: {
            first_name: 'Patient',
            last_name: 'Field 1',
          },
          relationships: { 'patient-fields': { data: [{ id: '1' }] } },
        });

        fx.included.push({
          id: '1',
          type: 'patient-fields',
          attributes: { value: { value: 1 }, name: 'foo' },
        });

        fx.included.push({
          id: '2',
          type: 'patients',
          attributes: {
            first_name: 'Patient',
            last_name: 'Field None',
          },
        });

        fx.included.push({
          id: '3',
          type: 'patients',
          attributes: {
            first_name: 'Patient',
            last_name: 'Field 2',
          },
          relationships: { 'patient-fields': { data: [{ id: '3' }] } },
        });

        fx.included.push({
          id: '3',
          type: 'patient-fields',
          attributes: { value: { value: 2 }, name: 'foo' },
        });

        return fx;
      })
      .routeActions()
      .visit('/worklist/shared-by')
      .wait('@routeActions');

    cy
      .get('.worklist-list__toggle')
      .contains('Flows')
      .click()
      .wait('@routeFlows');

    cy
      .get('.worklist-list__filter-sort')
      .click()
      .get('.picklist')
      .contains('Foo: Highest - Lowest')
      .click();

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .should('contain', 'Patient Field 2');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .last()
      .should('contain', 'Patient Field None');

    cy
      .get('.worklist-list__filter-sort')
      .click()
      .get('.picklist')
      .contains('Foo: Lowest - Highest')
      .click();

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .should('contain', 'Patient Field None');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .last()
      .should('contain', 'Patient Field 2');
  });

  specify('action sorting - preload', function() {
    localStorage.setItem(`shared-by_11111_11111-${ STATE_VERSION }`, JSON.stringify({
      id: 'shared-by',
      actionsSortId: 'sortNotExisting',
      flowsSortId: 'sortUpdateDesc',
      clinicianId: '11111',
      filters: {},
      actionsDateFilters: {
        selectedDate: testDate(),
        dateType: 'created_at',
      },
      actionsSelected: {},
      flowsSelected: {},
      listType: 'actions',
    }));

    cy
      .routesForPatientAction()
      .intercept('GET', '/api/actions*', { delay: 1000, body: { data: [] } })
      .visit('/worklist/shared-by');

    cy
      .get('.worklist-list__filter-sort')
      .should('contain', 'Added: Newest - Oldest')
      .click()
      .get('.picklist')
      .contains('Added: Oldest - Newest')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`shared-by_11111_11111-${ STATE_VERSION }`));

        expect(storage.actionsSortId).to.equal('sortCreatedAsc');
      });
  });

  specify('action sorting', function() {
    cy
      .routesForPatientAction()
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
      })
      .visit('/worklist/shared-by');

    cy
      .get('.worklist-list__filter-sort')
      .should('contain', 'Added: Newest - Oldest')
      .click()
      .get('.picklist')
      .contains('Added: Oldest - Newest')
      .click()
      .wait('@routeActions');

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
      .contains('Due: Sooner - Later')
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
      .contains('Due: Later - Sooner')
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
      .wait('@routeAction');

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
      .contains('Due: Later - Sooner');
  });

  specify('action sorting - patient', function() {
    cy
      .routesForPatientAction()
      .routeActions(fx => {
        fx.data = _.sample(fx.data, 3);

        fx.data[0].relationships.patient = { data: { id: 'b' } };
        fx.data[1].relationships.patient = { data: { id: 'c' } };
        fx.data[2].relationships.patient = { data: { id: 'a' } };

        fx.included.push({
          id: 'a',
          type: 'patients',
          attributes: {
            first_name: 'APatient',
            last_name: 'AName',
          },
        });

        fx.included.push({
          id: 'b',
          type: 'patients',
          attributes: {
            first_name: 'BPatient',
            last_name: 'AName',
          },
        });

        fx.included.push({
          id: 'c',
          type: 'patients',
          attributes: {
            first_name: 'APatient',
            last_name: 'BName',
          },
        });

        return fx;
      })
      .visit('/worklist/shared-by')
      .wait('@routeActions');

    cy
      .get('.worklist-list__filter-sort')
      .click()
      .get('.picklist')
      .contains('Patient Last: A')
      .click();

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .should('contain', 'APatient AName');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .last()
      .should('contain', 'APatient BName');

    cy
      .get('.worklist-list__filter-sort')
      .click()
      .get('.picklist')
      .contains('Patient Last: Z')
      .click();

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .should('contain', 'APatient BName');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .last()
      .should('contain', 'APatient AName');
  });

  specify('action sorting - patient field', function() {
    cy
      .routesForPatientAction()
      .routeActions(fx => {
        fx.data = _.sample(fx.data, 3);

        fx.data[0].relationships.patient = { data: { id: 'b' } };
        fx.data[1].relationships.patient = { data: { id: 'c' } };
        fx.data[2].relationships.patient = { data: { id: 'a' } };

        fx.included.push({
          id: 'a',
          type: 'patients',
          attributes: {
            first_name: 'Patient',
            last_name: 'Field A',
          },
          relationships: { 'patient-fields': { data: [{ id: '1' }] } },
        });

        fx.included.push({
          id: '1',
          type: 'patient-fields',
          attributes: { value: { value: 'A' }, name: 'foo' },
        });

        fx.included.push({
          id: 'b',
          type: 'patients',
          attributes: {
            first_name: 'Patient',
            last_name: 'Field C',
          },
          relationships: { 'patient-fields': { data: [{ id: '2' }] } },
        });

        fx.included.push({
          id: '2',
          type: 'patient-fields',
          attributes: { value: { value: 'C' }, name: 'foo' },
        });

        fx.included.push({
          id: 'c',
          type: 'patients',
          attributes: {
            first_name: 'Patient',
            last_name: 'Field B',
          },
          relationships: { 'patient-fields': { data: [{ id: '3' }] } },
        });

        fx.included.push({
          id: '3',
          type: 'patient-fields',
          attributes: { value: { value: 'B' }, name: 'foo' },
        });

        return fx;
      })
      .visit('/worklist/shared-by')
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', 'include=patient.patient-fields.foo');

    cy
      .get('.worklist-list__filter-sort')
      .click()
      .get('.picklist')
      .contains('Foo: Highest - Lowest')
      .click();

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .should('contain', 'Patient Field C');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .last()
      .should('contain', 'Patient Field A');

    cy
      .get('.worklist-list__filter-sort')
      .click()
      .get('.picklist')
      .contains('Foo: Lowest - Highest')
      .click();

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .should('contain', 'Patient Field A');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .last()
      .should('contain', 'Patient Field C');
  });

  specify('find in list', function() {
    const currentYear = dayjs().year();

    localStorage.setItem(`owned-by_11111_11111-${ STATE_VERSION }`, JSON.stringify({
      id: 'owned-by',
      actionsSortId: 'sortUpdateDesc',
      flowsSortId: 'sortUpdateDesc',
      clinicianId: '11111',
      filters: {},
      flowsDateFilters: {
        selectedMonth: `${ currentYear }-01-01`,
        dateType: 'created_at',
      },
      actionsSelected: {},
      flowsSelected: {},
      listType: 'flows',
    }));

    cy
      .routesForPatientDashboard()
      .routeFlows(fx => {
        _.each(fx.data, function(flow) {
          flow.attributes.created_at = `${ currentYear }-01-30`;
          flow.attributes.updated_at = `${ currentYear }-01-31`;
        });

        fx.data[0].attributes.name = 'Test Flow';
        fx.data[0].attributes.created_at = `${ currentYear }-01-04`;
        fx.data[0].attributes.updated_at = `${ currentYear }-01-05`;
        fx.data[0].relationships.patient.data.id = '1';
        fx.data[0].relationships.owner.data = {
          id: '11111',
          type: 'clinicians',
        };

        fx.data[1].attributes.name = 'Flow - Specialist';
        fx.data[1].attributes.created_at = `${ currentYear }-01-04`;
        fx.data[1].attributes.updated_at = `${ currentYear }-01-06`;
        fx.data[1].relationships.patient.data.id = '1';
        fx.data[1].relationships.owner.data = {
          id: '55555',
          type: 'teams',
        };

        fx.data[2].attributes.name = 'Flow - Team/State Search';
        fx.data[2].attributes.created_at = `${ currentYear }-01-04`;
        fx.data[2].attributes.updated_at = `${ currentYear }-01-07`;
        fx.data[2].relationships.patient.data.id = '1';
        fx.data[2].relationships.owner.data = {
          id: '22222',
          type: 'teams',
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
        });
        return fx;
      })
      .routePatient(fx => {
        fx.data.id = '1';
        return fx;
      })
      .routePatientByAction()
      .routeActions()
      .visit('/worklist/owned-by');

    cy
      .get('[data-count-region]')
      .should('not.contain', '10 Flows');

    cy
      .wait('@routeFlows');

    cy
      .get('[data-count-region]')
      .should('contain', '10 Flows');

    cy
      .get('.list-page__header')
      .find('[data-search-region] .js-input')
      .as('listSearch')
      .should('have.attr', 'placeholder', 'Find in List...')
      .focus()
      .type('abcd')
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
      .as('flowList')
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
      .should('contain', '10 Flows');

    cy
      .get('@flowList')
      .find('.work-list__item')
      .should('have.length', 10);

    cy
      .get('@listSearch')
      .type('Test');

    cy
      .get('[data-count-region]')
      .should('contain', '3 Flows');

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
      .type('Jan 7');

    cy
      .get('[data-count-region]')
      .should('contain', '1 Flow')
      .should('not.contain', 'Flows');

    cy
      .get('@flowList')
      .find('.work-list__item')
      .should('have.length', 1);

    cy
      .get('@listSearch')
      .next()
      .click();

    cy
      .get('@listSearch')
      .type('Jan 4');

    cy
      .get('[data-count-region]')
      .should('contain', '3 Flows');

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
      .find('.work-list__item .fa-square-check')
      .should('have.length', 3);

    cy
      .get('[data-select-all-region]')
      .find('.fa-square-check');

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
      .find('.fa-square-minus');

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
      .find('.work-list__item .fa-square-check')
      .should('have.length', 10)
      .first()
      .click();

    cy
      .get('[data-select-all-region]')
      .find('.fa-square-minus');

    cy
      .get('@listSearch')
      .type('Jan 4');

    cy
      .get('[data-select-all-region]')
      .find('.fa-square-check');

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
      .get('[data-count-region]')
      .should('contain', '1 Flow')
      .should('not.contain', 'Flows');

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
      .get('[data-count-region]')
      .should('contain', '1 Flow')
      .should('not.contain', 'Flows');

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
      .contains('Flow - Team/State Search');

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
      .contains('Flow - Team/State Search');

    cy
      .get('[data-date-filter-region]')
      .find('button.js-prev')
      .click();

    cy
      .wait('@routeFlows');

    cy
      .get('@listSearch')
      .invoke('val')
      .should('equal', 'Nurse');

    cy
      .get('[data-nav-content-region]')
      .find('[data-worklists-region]')
      .find('.app-nav__link')
      .contains('Schedule')
      .click()
      .wait('@routeActions');

    cy
      .get('[data-nav-content-region]')
      .find('[data-worklists-region]')
      .find('.app-nav__link')
      .contains('Owned By')
      .click()
      .wait('@routeFlows');

    cy
      .get('@listSearch')
      .should('have.attr', 'value', 'Nurse');

    cy
      .get('.list-page__header')
      .find('[data-search-region] .list-search__container')
      .should('have.class', 'is-applied');
  });

  specify('click+shift multiselect', function() {
    cy
      .routeActions(fx => {
        fx.data = _.sample(fx.data, 3);

        return fx;
      })
      .routeFlows()
      .routeFlow()
      .routeFlowActions()
      .routePatientByFlow()
      .visit('/worklist/owned-by')
      .wait('@routeActions');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .as('firstTableListItem')
      .find('.js-select')
      .click();

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .last()
      .as('lastTableListItem')
      .find('.js-select')
      .click({ shiftKey: true });

    cy
      .get('.app-frame__content')
      .find('.table-list__item.is-selected')
      .should('have.length', 3);

    cy
      .get('[data-filters-region]')
      .find('.js-bulk-edit')
      .should('contain', 'Edit 3 Actions');

    cy
      .get('[data-filters-region]')
      .find('.js-cancel')
      .click();

    cy
      .get('@lastTableListItem')
      .find('.js-select')
      .click();

    cy
      .get('@firstTableListItem')
      .find('.js-select')
      .click({ shiftKey: true });

    cy
      .get('.app-frame__content')
      .find('.table-list__item.is-selected')
      .should('have.length', 3);

    cy
      .get('[data-filters-region]')
      .find('.js-bulk-edit')
      .should('contain', 'Edit 3 Actions');

    cy
      .get('[data-filters-region]')
      .find('.js-cancel')
      .click();

    cy
      .get('@firstTableListItem')
      .find('.js-select')
      .click();

    cy
      .get('@firstTableListItem')
      .find('.js-select')
      .click();

    cy
      .get('@lastTableListItem')
      .find('.js-select')
      .click({ shiftKey: true });

    cy
      .get('.app-frame__content')
      .find('.table-list__item.is-selected')
      .should('have.length', 1);

    cy
      .get('[data-filters-region]')
      .find('.js-cancel')
      .click();

    cy
      .get('@firstTableListItem')
      .find('.js-select')
      .click();

    cy
      .get('[data-filters-region]')
      .find('.js-cancel')
      .click();

    cy
      .get('@lastTableListItem')
      .find('.js-select')
      .click({ shiftKey: true });

    cy
      .get('.app-frame__content')
      .find('.table-list__item.is-selected')
      .should('have.length', 1);

    cy
      .get('[data-filters-region]')
      .find('.js-cancel')
      .click();

    cy
      .get('@firstTableListItem')
      .find('.js-select')
      .click();

    cy
      .get('.list-page__header')
      .find('[data-search-region] .js-input')
      .as('listSearch')
      .focus()
      .type('abcd');

    cy
      .get('@listSearch')
      .next()
      .click();

    cy
      .get('@lastTableListItem')
      .find('.js-select')
      .click();

    cy
      .get('.app-frame__content')
      .find('.table-list__item.is-selected')
      .should('have.length', 2);

    cy
      .get('[data-filters-region]')
      .find('.js-cancel')
      .click();

    cy
      .get('@firstTableListItem')
      .find('.js-select')
      .click();

    cy
      .get('.worklist-list__toggle')
      .contains('Flows')
      .click()
      .wait('@routeFlows');

    cy
      .get('.worklist-list__toggle')
      .contains('Actions')
      .click()
      .wait('@routeActions');

    cy
      .get('@lastTableListItem')
      .find('.js-select')
      .click();

    cy
      .get('.app-frame__content')
      .find('.table-list__item.is-selected')
      .should('have.length', 2);

    cy
      .get('[data-filters-region]')
      .find('.js-cancel')
      .click();

    cy
      .get('@firstTableListItem')
      .find('.js-select')
      .click();

    cy
      .navigate('/schedule');

    cy
      .go('back');

    cy
      .get('@lastTableListItem')
      .find('.js-select')
      .click();

    cy
      .get('.app-frame__content')
      .find('.table-list__item.is-selected')
      .should('have.length', 2);
  });

  specify('patient sidebar', function() {
    const testField = {
      id: '1',
      name: 'test-field',
      value: '1',
    };

    const testPatient = {
      first_name: 'Test',
      last_name: 'Patient',
      sex: 'f',
    };

    cy
      .routesForPatientDashboard()
      .routePatient(fx => {
        fx.data.id = '1';
        fx.data.attributes = testPatient;
        fx.data.relationships['patient-fields'].data = [testField];

        return fx;
      })
      .routeFlows(fx => {
        fx.data = [{
          id: '1',
          type: 'flows',
          attributes: {
            name: 'Test Flow Item',
            details: null,
          },
          relationships: {
            owner: {
              data: {
                id: '11111',
                type: 'teams',
              },
            },
            state: { data: { id: '22222' } },
            patient: { data: { id: '1' } },
            flow: { data: { id: '1' } },
          },
        }];

        fx.included.push({
          id: '1',
          type: 'patients',
          attributes: testPatient,
        });

        return fx;
      })
      .routeActions(fx => {
        fx.data = [{
          id: '1',
          type: 'actions',
          attributes: {
            name: 'Test Action Item',
            details: null,
          },
          relationships: {
            owner: {
              data: {
                id: '11111',
                type: 'teams',
              },
            },
            state: { data: { id: '22222' } },
            patient: { data: { id: '1' } },
            flow: { data: { id: '1' } },
          },
        }];

        fx.included.push({
          id: '1',
          type: 'patients',
          attributes: testPatient,
        });

        return fx;
      })
      .routeSettings(fx => {
        fx.data[0].attributes = {
          value: {
            widgets: ['sex', 'optionsWidget1'],
            fields: [testField],
          },
        };

        return fx;
      })
      .routeWidgets(fx => {
        const addWidget = _.partial(getResource, _, 'widgets');

        fx.data = fx.data.concat([
          addWidget({
            id: 'optionsWidget1',
            widget_type: 'optionsWidget',
            definition: {
              display_name: 'Test Field Widget',
              field_name: 'test-field',
              display_options: { '1': 'Test Field' },
            },
          }),
        ]);

        return fx;
      })
      .routePatientField(fx => {
        fx.data = getResource(testField, 'patient-fields');

        return fx;
      })
      .routeFlow()
      .routeFlowActions()
      .visit('/worklist/owned-by')
      .wait('@routeWidgets')
      .wait('@routeActions');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .as('firstRow');

    cy
      .get('@firstRow')
      .find('.worklist-list__patient-sidebar-icon .js-patient-sidebar-button')
      .click();

    cy
      .get('.app-frame__sidebar .sidebar')
      .as('patientSidebar')
      .find('.worklist-patient-sidebar__patient-name')
      .should('contain', 'Test Patient')
      .click()
      .wait('@routePatientField')
      .wait('@routePrograms');

    cy
      .url()
      .should('contain', 'patient/dashboard/1');

    cy
      .get('.patient-sidebar')
      .find('.patient-sidebar__name')
      .should('contain', 'Test Patient');

    cy
      .go('back');

    cy
      .get('@firstRow')
      .find('.worklist-list__patient-sidebar-icon .js-patient-sidebar-button')
      .click();

    cy
      .get('@patientSidebar')
      .find('.worklist-patient-sidebar__patient-info .button--link')
      .should('contain', 'View Patient Dashboard')
      .click()
      .wait('@routePatientField')
      .wait('@routePrograms');

    cy
      .url()
      .should('contain', 'patient/dashboard/1');

    cy
      .get('.patient-sidebar')
      .find('.patient-sidebar__name')
      .should('contain', 'Test Patient');

    cy
      .go('back');

    cy
      .get('@firstRow')
      .find('.worklist-list__patient-sidebar-icon .js-patient-sidebar-button')
      .click();

    cy
      .get('@patientSidebar')
      .find('.patient-sidebar__section')
      .first()
      .should('contain', 'Sex')
      .should('contain', 'Female')
      .next()
      .should('contain', 'Test Field Widget')
      .should('contain', 'Test Field');

    cy
      .get('@patientSidebar')
      .find('.worklist-patient-sidebar__close-icon button')
      .click();

    cy
      .get('@patientSidebar')
      .should('not.exist');

    cy
      .get('.worklist-list__toggle')
      .contains('Flows')
      .click()
      .wait('@routeFlows');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .find('.worklist-list__patient-sidebar-icon .js-patient-sidebar-button')
      .click();

    cy
      .get('@patientSidebar')
      .find('.worklist-patient-sidebar__patient-name')
      .should('contain', 'Test Patient');

    cy
      .get('[data-date-filter-region]')
      .find('button.js-prev')
      .click();

    cy
      .get('@patientSidebar')
      .should('not.exist');
  });

  specify('empty flows view', function() {
    cy
      .routeFlows(fx => {
        fx.data = [];

        return fx;
      })
      .routeActions()
      .visit('/worklist/owned-by')
      .wait('@routeActions');

    cy
      .get('.worklist-list__toggle')
      .contains('Flows')
      .click()
      .wait('@routeFlows');

    cy
      .get('[data-count-region] div')
      .should('be.empty');

    cy
      .get('.table-empty-list')
      .contains('No Flows');
  });

  specify('empty actions view', function() {
    cy
      .routeActions(fx => {
        fx.data = [];

        return fx;
      })
      .visit('/worklist/owned-by')
      .wait('@routeActions');

    cy
      .get('[data-count-region] div')
      .should('be.empty');

    cy
      .get('.table-empty-list')
      .contains('No Actions');
  });

  specify('actions without work:manage permission', function() {
    cy
      .routeCurrentClinician(fx => {
        fx.data.relationships.role = { data: { id: '66666' } };
        return fx;
      })
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
            created_at: testTs(),
          },
          relationships: {
            owner: {
              data: {
                id: '11111',
                type: 'clinicians',
              },
            },
            state: { data: { id: '22222' } },
            patient: { data: { id: '1' } },
            form: { data: { id: '11111' } },
            flow: { data: { id: '1' } },
          },
        };

        fx.data[1].id = '3';
        fx.data[1].relationships.state = { data: { id: '22222' } };
        fx.data[1].relationships.owner = { data: { id: '11111', type: 'teams' } };
        fx.data[1].attributes.name = 'Last In List';
        fx.data[1].attributes.due_date = testDateAdd(5);
        fx.data[1].attributes.created_at = testTsSubtract(3);
        fx.data[1].relationships.patient = { data: { id: '2' } };

        fx.data[2] = {
          id: '2',
          type: 'actions',
          attributes: {
            name: 'Second In List',
            details: null,
            duration: 0,
            due_date: testDateAdd(3),
            due_time: null,
            created_at: testTsSubtract(1),
          },
          relationships: {
            owner: {
              data: {
                id: '11111',
                type: 'teams',
              },
            },
            state: { data: { id: '22222' } },
            patient: { data: { id: '1' } },
            form: { data: { id: '11111' } },
          },
        };

        fx.data[3].id = '4';
        fx.data[3].attributes.created_at = testTsSubtract(2);
        fx.data[3].attributes.due_date = null;
        fx.data[3].attributes.due_time = null;
        fx.data[3].relationships.owner = { data: { id: '11111', type: 'teams' } };
        fx.data[3].relationships.state = { data: { id: '33333' } };

        fx.included.push(flowInclude);

        return fx;
      })
      .routeFlow()
      .routeFlowActions()
      .routePatientByFlow()
      .visit('/worklist/owned-by')
      .wait('@routeActions');

    cy
      .get('[data-select-all-region] button:enabled')
      .click();

    cy
      .get('[data-filters-region]')
      .find('.js-bulk-edit')
      .should('contain', 'Edit 1 Action');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .find('.worklist-list__meta')
      .find('button:enabled')
      .should('have.length', 4);

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .last()
      .find('.worklist-list__meta')
      .find('button')
      .should('not.exist');
  });

  specify('flows without work:manage permission', function() {
    cy
      .routeCurrentClinician(fx => {
        fx.data.relationships.role = { data: { id: '66666' } };
        return fx;
      })
      .routeFlows(fx => {
        fx.data = _.sample(fx.data, 3);
        fx.data[0].id = '1';
        fx.data[0].relationships.state = { data: { id: '22222' } };
        fx.data[0].relationships.owner = { data: { id: '11111', type: 'clinicians' } };
        fx.data[0].attributes.created_at = testTsSubtract(1);

        fx.data[1].id = '2';
        fx.data[1].relationships.state = { data: { id: '22222' } };
        fx.data[1].relationships.owner = { data: { id: '11111', type: 'teams' } };
        fx.data[1].attributes.created_at = testTsSubtract(2);

        fx.data[2].id = '3';
        fx.data[2].relationships.state = { data: { id: '55555' } };
        fx.data[2].relationships.owner = { data: { id: '11111', type: 'teams' } };
        fx.data[2].attributes.created_at = testTsSubtract(3);

        fx.included.push({
          id: '1',
          type: 'patients',
          attributes: {
            first_name: 'Test',
            last_name: 'Patient',
          },
        });

        return fx;
      })
      .routeActions()
      .routeFlow()
      .routeFlowActions()
      .routePatientByFlow()
      .visit('/worklist/owned-by')
      .wait('@routeActions');

    cy
      .intercept('PATCH', '/api/flows/*', {
        statusCode: 204,
        body: {},
      })
      .as('patchFlow');

    cy
      .get('.worklist-list__toggle')
      .contains('Flows')
      .click()
      .wait('@routeFlows');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .as('firstRow')
      .find('[data-owner-region]')
      .find('button');

    cy
      .get('@firstRow')
      .next()
      .as('secondRow')
      .find('[data-state-region]')
      .find('button')
      .should('not.exist');

    cy
      .get('@secondRow')
      .find('[data-state-region]')
      .find('.fa-circle-exclamation');

    cy
      .get('@secondRow')
      .find('[data-owner-region]')
      .should('contain', 'Coordinator')
      .find('button')
      .should('not.exist');

    cy
      .get('@secondRow')
      .next()
      .as('thirdRow')
      .find('[data-state-region]')
      .find('button')
      .should('not.exist');

    cy
      .get('@thirdRow')
      .find('[data-state-region]')
      .find('.fa-circle-check');

    cy
      .get('@thirdRow')
      .find('[data-owner-region]')
      .should('contain', 'Coordinator')
      .find('button')
      .should('not.exist');
  });
});
