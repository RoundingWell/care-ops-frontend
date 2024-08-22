import { NIL as NIL_UUID } from 'uuid';

import { mergeJsonApi, getRelationship } from 'helpers/json-api';

import { workspaceOne, workspaceTwo } from 'support/api/workspaces';
import { getCurrentClinician } from 'support/api/clinicians';
import { roleReducedEmployee } from 'support/api/roles';
import { stateTodo, stateInProgress, stateDone, stateUnableToComplete } from 'support/api/states';

const STATE_VERSION = 'v6';

context('filter sidebar', function() {
  const testStates = [stateTodo, stateInProgress, stateDone, stateUnableToComplete];

  specify('worklist filtering', function() {
    localStorage.setItem(`owned-by_11111_${ workspaceOne.id }-${ STATE_VERSION }`, JSON.stringify({
      id: 'owned-by',
      customFilters: {
        insurance: 'Medicare',
      },
      states: [stateTodo.id, stateInProgress.id],
      flowStates: [stateTodo.id, stateInProgress.id],
    }));

    cy
      .routeWorkspaces(fx => {
        fx.data = [
          mergeJsonApi(workspaceOne, {
            relationships: {
              states: { data: testStates },
            },
          }),
          mergeJsonApi(workspaceTwo, {
            relationships: {
              states: { data: testStates },
            },
          }),
        ];

        return fx;
      })
      .routeStates(fx => {
        fx.data = testStates;

        return fx;
      })
      .routeActions()
      .routeFlows()
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
      .should('contain', `filter[state]=${ stateTodo.id },${ stateInProgress.id }`)
      .should('contain', `filter[flow.state]=${ stateTodo.id },${ stateInProgress.id }`);

    cy
      .get('.worklist-list__toggle')
      .contains('Flows')
      .click()
      .wait('@routeFlows');

    cy
      .get('.list-page__filters')
      .find('[data-filters-region]')
      .find('button')
      .click();

    cy
      .get('[data-flow-states-filters-region]')
      .should('be.empty');

    cy
      .get('.worklist-list__toggle')
      .contains('Actions')
      .click()
      .wait('@routeActions');

    cy
      .get('.list-page__filters')
      .find('[data-filters-region]')
      .find('button')
      .should('contain', '1');

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
        const storage = JSON.parse(localStorage.getItem(`owned-by_11111_${ workspaceOne.id }-${ STATE_VERSION }`));

        expect(storage.customFilters.insurance).to.be.null;
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
        const storage = JSON.parse(localStorage.getItem(`owned-by_11111_${ workspaceOne.id }-${ STATE_VERSION }`));

        expect(storage.customFilters.insurance).to.equal('BCBS PPO 100');
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
        const storage = JSON.parse(localStorage.getItem(`owned-by_11111_${ workspaceOne.id }-${ STATE_VERSION }`));

        expect(storage.customFilters.insurance).to.be.undefined;
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
      .should('have.length', 2);

    cy
      .get('@filtersSidebar')
      .find('[data-states-filters-region]')
      .should('contain', 'To Do')
      .should('contain', 'In Progress')
      .should('contain', 'Done')
      .should('contain', 'Unable to Complete');

    cy
      .get('@filtersSidebar')
      .find('[data-states-filters-region]')
      .find('[data-check-region]')
      .first()
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`owned-by_11111_${ workspaceOne.id }-${ STATE_VERSION }`));

        expect(storage.states).to.deep.equal([stateInProgress.id]);
      })
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', `filter[state]=${ stateInProgress.id }`)
      .should('not.contain', `filter[state]=${ stateTodo.id }`);

    cy
      .get('@filtersSidebar')
      .find('[data-flow-states-filters-region]')
      .should('contain', 'To Do')
      .should('contain', 'In Progress')
      .should('contain', 'Done')
      .should('contain', 'Unable to Complete');

    cy
      .get('@filtersSidebar')
      .find('[data-flow-states-filters-region]')
      .find('[data-check-region]')
      .first()
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`owned-by_11111_${ workspaceOne.id }-${ STATE_VERSION }`));

        expect(storage.flowStates).to.deep.equal([stateInProgress.id]);
      })
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', `filter[flow.state]=${ stateInProgress.id }`)
      .should('not.contain', `filter[flow.state]=${ stateTodo.id }`);

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
      .find('[data-flow-states-filters-region]')
      .find('.fa-square-check')
      .should('have.length', 1);

    cy
      .get('@filtersSidebar')
      .find('[data-flow-states-filters-region]')
      .find('.fa-square')
      .should('have.length', 3);

    cy
      .get('@filtersSidebar')
      .find('[data-states-filters-region]')
      .find('[data-check-region]')
      .eq(1)
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`owned-by_11111_${ workspaceOne.id }-${ STATE_VERSION }`));

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
      .should('contain', '2');

    cy
      .get('@filtersSidebar')
      .find('.sidebar__heading')
      .should('contain', '2');

    cy
      .get('@filtersSidebar')
      .find('[data-states-filters-region]')
      .find('.fa-square-check')
      .should('have.length', 0);

    cy
      .get('@filtersSidebar')
      .find('[data-states-filters-region]')
      .find('.fa-square')
      .should('have.length', 4);

    cy
      .get('@filtersSidebar')
      .find('[data-flow-states-filters-region]')
      .find('[data-check-region]')
      .eq(1)
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`owned-by_11111_${ workspaceOne.id }-${ STATE_VERSION }`));

        expect(storage.flowStates).to.deep.equal([]);
      })
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', `filter[flow.state]=${ NIL_UUID }`);

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
      .find('[data-flow-states-filters-region]')
      .find('.fa-square-check')
      .should('have.length', 0);

    cy
      .get('@filtersSidebar')
      .find('[data-flow-states-filters-region]')
      .find('.fa-square')
      .should('have.length', 4);

    cy
      .get('@filtersSidebar')
      .find('[data-states-filters-region]')
      .find('[data-check-region]')
      .eq(1)
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`owned-by_11111_${ workspaceOne.id }-${ STATE_VERSION }`));

        expect(storage.states).to.deep.equal([stateInProgress.id]);
      })
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', `filter[state]=${ stateInProgress.id }`);

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
      .find('[data-states-filters-region]')
      .find('.fa-square-check')
      .should('have.length', 1);

    cy
      .get('@filtersSidebar')
      .find('[data-states-filters-region]')
      .find('.fa-square')
      .should('have.length', 3);

    cy
      .get('@filtersSidebar')
      .find('.js-clear-filters')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`owned-by_11111_${ workspaceOne.id }-${ STATE_VERSION }`));

        expect(storage.states).to.deep.equal([stateTodo.id, stateInProgress.id]);
      })
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', `filter[flow.state]=${ stateTodo.id },${ stateInProgress.id }`)
      .should('contain', `filter[state]=${ stateTodo.id },${ stateInProgress.id }`);

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
      .should('have.length', 2);

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

  specify('worklist filtering - done states', function() {
    cy
      .routeStates(fx => {
        fx.data = testStates;

        return fx;
      })
      .routeActions()
      .routeFlow()
      .routeFlowActions()
      .routePatientByFlow()
      .routeDirectories()
      .visit('/worklist/done-last-thirty-days')
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', `filter[state]=${ stateDone.id },${ stateUnableToComplete.id }`);

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
      .should('have.length', 2);

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
      .should('contain', 'Unable to Complete');

    cy
      .get('@filtersSidebar')
      .find('[data-states-filters-region]')
      .find('[data-check-region]')
      .first()
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`done-last-thirty-days_11111_${ workspaceOne.id }-${ STATE_VERSION }`));

        expect(storage.states).to.deep.equal([stateUnableToComplete.id]);
      })
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', `filter[state]=${ stateUnableToComplete.id }`);

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
      .should('have.length', 1);

    cy
      .get('@filtersSidebar')
      .find('.js-clear-filters')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`done-last-thirty-days_11111_${ workspaceOne.id }-${ STATE_VERSION }`));

        expect(storage.states).to.deep.equal([stateDone.id, stateUnableToComplete.id]);
      })
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', `filter[state]=${ stateDone.id },${ stateUnableToComplete.id }`);

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
      .should('have.length', 2);

    cy
      .get('@filtersSidebar')
      .find('[data-states-filters-region]')
      .find('.fa-square')
      .should('have.length', 0);
  });

  specify('schedule filtering', function() {
    localStorage.setItem(`schedule_11111_${ workspaceOne.id }-${ STATE_VERSION }`, JSON.stringify({
      customFilters: {
        insurance: 'Medicare',
      },
      states: [stateTodo.id, stateInProgress.id],
      flowStates: [stateTodo.id, stateInProgress.id],
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
      .should('contain', 'filter[clinician]=11111')
      .should('contain', 'filter[@insurance]=Medicare')
      .should('contain', `filter[state]=${ stateTodo.id },${ stateInProgress.id }`)
      .should('contain', `filter[flow.state]=${ stateTodo.id },${ stateInProgress.id }`);

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
        const storage = JSON.parse(localStorage.getItem(`schedule_11111_${ workspaceOne.id }-${ STATE_VERSION }`));

        expect(storage.customFilters.insurance).to.be.null;
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
        const storage = JSON.parse(localStorage.getItem(`schedule_11111_${ workspaceOne.id }-${ STATE_VERSION }`));

        expect(storage.customFilters.insurance).to.equal('BCBS PPO 100');
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
        const storage = JSON.parse(localStorage.getItem(`schedule_11111_${ workspaceOne.id }-${ STATE_VERSION }`));

        expect(storage.customFilters.insurance).to.be.undefined;
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
        const storage = JSON.parse(localStorage.getItem(`schedule_11111_${ workspaceOne.id }-${ STATE_VERSION }`));

        expect(storage.states).to.deep.equal([stateInProgress.id]);
      })
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', `filter[state]=${ stateInProgress.id }`)
      .should('not.contain', `filter[state]=${ stateTodo.id }`);

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
      .find('[data-flow-states-filters-region]')
      .find('[data-check-region]')
      .first()
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`schedule_11111_${ workspaceOne.id }-${ STATE_VERSION }`));

        expect(storage.flowStates).to.deep.equal([stateInProgress.id]);
      })
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', `filter[flow.state]=${ stateInProgress.id }`)
      .should('not.contain', `filter[flow.state]=${ stateTodo.id }`);

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
      .find('[data-states-filters-region]')
      .find('[data-check-region]')
      .eq(1)
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`schedule_11111_${ workspaceOne.id }-${ STATE_VERSION }`));

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
      .should('contain', '2');

    cy
      .get('@filtersSidebar')
      .find('.sidebar__heading')
      .should('contain', '2');

    cy
      .get('@filtersSidebar')
      .find('[data-flow-states-filters-region]')
      .find('[data-check-region]')
      .eq(1)
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`schedule_11111_${ workspaceOne.id }-${ STATE_VERSION }`));

        expect(storage.flowStates).to.deep.equal([]);
      })
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', `filter[flow.state]=${ NIL_UUID }`);

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
      .should('contain', '3');

    cy
      .get('@filtersSidebar')
      .find('.sidebar__heading')
      .should('contain', '3');

    cy
      .get('@filtersSidebar')
      .find('.js-clear-filters')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`schedule_11111_${ workspaceOne.id }-${ STATE_VERSION }`));

        expect(storage.states).to.deep.equal([stateTodo.id, stateInProgress.id]);
      })
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', `filter[state]=${ stateTodo.id },${ stateInProgress.id }`)
      .should('contain', `filter[flow.state]=${ stateTodo.id },${ stateInProgress.id }`)
      .should('not.contain', 'filter[@insurance]');

    cy
      .get('.list-page__filters')
      .find('[data-filters-region]')
      .find('button')
      .should('not.contain', '3');

    cy
      .get('@filtersSidebar')
      .find('.sidebar__heading')
      .should('not.contain', '3');

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

  specify('reduced schedule filtering', function() {
    localStorage.setItem(`reduced-schedule_11111_${ workspaceOne.id }-${ STATE_VERSION }`, JSON.stringify({
      customFilters: {
        insurance: 'Medicare',
      },
      states: [stateTodo.id, stateInProgress.id],
      flowStates: [stateTodo.id, stateInProgress.id],
    }));

    const currentClinician = getCurrentClinician({
      relationships: {
        role: getRelationship(roleReducedEmployee),
      },
    });

    cy
      .routesForPatientDashboard()
      .routeCurrentClinician(fx => {
        fx.data = currentClinician;

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
      .visit()
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', `filter[clinician]=${ currentClinician.id }`)
      .should('contain', 'filter[@insurance]=Medicare')
      .should('contain', `filter[state]=${ stateTodo.id },${ stateInProgress.id }`)
      .should('contain', `filter[flow.state]=${ stateTodo.id },${ stateInProgress.id }`);

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
        const storage = JSON.parse(localStorage.getItem(`reduced-schedule_11111_${ workspaceOne.id }-${ STATE_VERSION }`));

        expect(storage.customFilters.insurance).to.be.null;
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
        const storage = JSON.parse(localStorage.getItem(`reduced-schedule_11111_${ workspaceOne.id }-${ STATE_VERSION }`));

        expect(storage.customFilters.insurance).to.equal('BCBS PPO 100');
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
        const storage = JSON.parse(localStorage.getItem(`reduced-schedule_11111_${ workspaceOne.id }-${ STATE_VERSION }`));

        expect(storage.customFilters.insurance).to.be.undefined;
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
      .find('.fa-square-check')
      .should('have.length', 2);

    cy
      .get('@filtersSidebar')
      .find('[data-states-filters-region]')
      .find('[data-check-region]')
      .first()
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`reduced-schedule_11111_${ workspaceOne.id }-${ STATE_VERSION }`));

        expect(storage.states).to.deep.equal([stateInProgress.id]);
      })
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', `filter[state]=${ stateInProgress.id }`)
      .should('not.contain', `filter[state]=${ stateTodo.id }`);

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
      .find('[data-flow-states-filters-region]')
      .find('[data-check-region]')
      .first()
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`reduced-schedule_11111_${ workspaceOne.id }-${ STATE_VERSION }`));

        expect(storage.flowStates).to.deep.equal([stateInProgress.id]);
      })
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', `filter[flow.state]=${ stateInProgress.id }`)
      .should('not.contain', `filter[flow.state]=${ stateTodo.id }`);

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
      .find('[data-states-filters-region]')
      .find('[data-check-region]')
      .eq(1)
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`reduced-schedule_11111_${ workspaceOne.id }-${ STATE_VERSION }`));

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
      .should('contain', '2');

    cy
      .get('@filtersSidebar')
      .find('.sidebar__heading')
      .should('contain', '2');

    cy
      .get('@filtersSidebar')
      .find('[data-flow-states-filters-region]')
      .find('[data-check-region]')
      .eq(1)
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`reduced-schedule_11111_${ workspaceOne.id }-${ STATE_VERSION }`));

        expect(storage.flowStates).to.deep.equal([]);
      })
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', `filter[flow.state]=${ NIL_UUID }`);

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
      .should('contain', '3');

    cy
      .get('@filtersSidebar')
      .find('.sidebar__heading')
      .should('contain', '3');

    cy
      .get('@filtersSidebar')
      .find('.js-clear-filters')
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`reduced-schedule_11111_${ workspaceOne.id }-${ STATE_VERSION }`));

        expect(storage.states).to.deep.equal([stateTodo.id, stateInProgress.id]);
      })
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', `filter[state]=${ stateTodo.id },${ stateInProgress.id }`)
      .should('contain', `filter[flow.state]=${ stateTodo.id },${ stateInProgress.id }`)
      .should('not.contain', 'filter[@insurance]');

    cy
      .get('.list-page__filters')
      .find('[data-filters-region]')
      .find('button')
      .should('not.contain', '3');

    cy
      .get('@filtersSidebar')
      .find('.sidebar__heading')
      .should('not.contain', '3');

    cy
      .get('@filtersSidebar')
      .find('.js-close')
      .click();

    cy
      .get('@filtersSidebar')
      .should('not.exist');
  });

  specify('states sorted by sequence value', function() {
    const testSequenceStates = [
      mergeJsonApi(stateTodo, {
        attributes: {
          name: 'Second In Sequence',
          sequence: 200,
          status: 'queued',
        },
      }),
      mergeJsonApi(stateInProgress, {
        attributes: {
          name: 'Third In Sequence',
          sequence: 300,
          status: 'queued',
        },
      }),
      mergeJsonApi(stateDone, {
        attributes: {
          name: 'First In Sequence',
          sequence: 100,
          status: 'queued',
        },
      }),
    ];

    cy
      .routeStates(fx => {
        fx.data = testSequenceStates;

        return fx;
      })
      .routeWorkspaces(fx => {
        fx.data[0] = mergeJsonApi(workspaceOne, {
          relationships: {
            states: { data: testSequenceStates },
          },
        });

        return fx;
      })
      .routeActions()
      .routeFlows()
      .visit('/worklist/owned-by')
      .wait('@routeActions');

    cy
      .get('.worklist-list__toggle')
      .contains('Flows')
      .click()
      .wait('@routeFlows');

    cy
      .get('.list-page__filters')
      .find('[data-filters-region]')
      .find('button')
      .click();

    cy
      .get('.app-frame__sidebar .sidebar')
      .find('[data-states-filters-region] .sidebar__section')
      .children()
      .eq(1)
      .should('contain', 'First In Sequence')
      .next()
      .should('contain', 'Second In Sequence')
      .next()
      .should('contain', 'Third In Sequence');
  });
});

