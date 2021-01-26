import _ from 'underscore';
import dayjs from 'dayjs';

import { testDateAdd } from 'helpers/test-date';

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
    let dayIncrement = 0;

    cy
      .server()
      .routeGroupsBootstrap(_.identity, testGroups)
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
      .find('.picklist__heading')
      .should('contain', 'Group One');
  });
});
