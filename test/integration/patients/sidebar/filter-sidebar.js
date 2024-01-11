import _ from 'underscore';
import { NIL as NIL_UUID } from 'uuid';

import { workspaceOne } from 'support/api/workspaces';

const STATE_VERSION = 'v6';

context('filter sidebar', function() {
  specify('worklist filtering', function() {
    localStorage.setItem(`owned-by_11111_${ workspaceOne.id }-${ STATE_VERSION }`, JSON.stringify({
      id: 'owned-by',
      customFilters: {
        insurance: 'Medicare',
      },
      states: ['22222', '33333'],
      flowStates: ['22222', '33333'],
    }));

    function hasTestState({ id }) {
      return ['22222', '33333', '55555', '66666'].includes(id);
    }

    cy
      .routeWorkspaces(fx => {
        _.each(fx.data, workspace => {
          const states = workspace.relationships.states.data;

          workspace.relationships.states.data = _.filter(states, hasTestState);
        });

        return fx;
      })
      .routeStates(fx => {
        fx.data = _.filter(fx.data, hasTestState);
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
      .should('contain', 'filter[state]=22222,33333')
      .should('contain', 'filter[flow.state]=22222,33333');

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

        expect(storage.states).to.deep.equal(['33333']);
      })
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[state]=33333')
      .should('not.contain', 'filter[state]=22222');

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

        expect(storage.flowStates).to.deep.equal(['33333']);
      })
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[flow.state]=33333')
      .should('not.contain', 'filter[flow.state]=22222');

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

        expect(storage.states).to.deep.equal(['22222', '33333']);
      })
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[flow.state]=22222,33333')
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
        fx.data = _.filter(fx.data, state => {
          return ['22222', '33333', '55555', '66666'].includes(state.id);
        });
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
      .should('contain', 'filter[state]=55555,66666');

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

        expect(storage.states).to.deep.equal(['66666']);
      })
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[state]=66666');

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

        expect(storage.states).to.deep.equal(['55555', '66666']);
      })
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[state]=55555,66666');

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
      states: ['22222', '33333'],
      flowStates: ['22222', '33333'],
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
      .should('contain', 'filter[state]=22222,33333')
      .should('contain', 'filter[flow.state]=22222,33333');

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
      .find('[data-flow-states-filters-region]')
      .find('[data-check-region]')
      .first()
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`schedule_11111_${ workspaceOne.id }-${ STATE_VERSION }`));

        expect(storage.flowStates).to.deep.equal(['33333']);
      })
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[flow.state]=33333')
      .should('not.contain', 'filter[flow.state]=22222');

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

        expect(storage.states).to.deep.equal(['22222', '33333']);
      })
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[state]=22222,33333')
      .should('contain', 'filter[flow.state]=22222,33333')
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
      states: ['22222', '33333'],
      flowStates: ['22222', '33333'],
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
      .visit()
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[clinician]=11111')
      .should('contain', 'filter[@insurance]=Medicare')
      .should('contain', 'filter[state]=22222,33333')
      .should('contain', 'filter[flow.state]=22222,33333');

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
      .find('[data-flow-states-filters-region]')
      .find('[data-check-region]')
      .first()
      .click()
      .then(() => {
        const storage = JSON.parse(localStorage.getItem(`reduced-schedule_11111_${ workspaceOne.id }-${ STATE_VERSION }`));

        expect(storage.flowStates).to.deep.equal(['33333']);
      })
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[flow.state]=33333')
      .should('not.contain', 'filter[flow.state]=22222');

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

        expect(storage.states).to.deep.equal(['22222', '33333']);
      })
      .wait('@routeActions')
      .itsUrl()
      .its('search')
      .should('contain', 'filter[state]=22222,33333')
      .should('contain', 'filter[flow.state]=22222,33333')
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
    cy
      .routeStates(fx => {
        fx.data = fx.data.slice(0, 3);

        fx.data[0].attributes.name = 'Second In Sequence';
        fx.data[0].attributes.sequence = 200;
        fx.data[0].attributes.status = 'queued';

        fx.data[1].attributes.name = 'Third In Sequence';
        fx.data[1].attributes.sequence = 300;
        fx.data[1].attributes.status = 'queued';

        fx.data[2].attributes.name = 'First In Sequence';
        fx.data[2].attributes.sequence = 100;
        fx.data[2].attributes.status = 'queued';

        return fx;
      })
      .routeWorkspaces(fx => {
        fx.data[0].relationships.states.data = [
          { id: '22222', type: 'states' },
          { id: '33333', type: 'states' },
          { id: '55555', type: 'states' },
        ];

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

