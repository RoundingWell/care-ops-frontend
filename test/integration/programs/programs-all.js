import _ from 'underscore';

import { testTs, testTsSubtract } from 'helpers/test-timestamp';

context('program all list', function() {
  specify('display programs list', function() {
    cy
      .routePrograms(fx => {
        fx.data = _.sample(fx.data, 3);

        fx.data[0] = {
          id: '1',
          attributes: {
            name: 'First in List',
            published_at: testTs(),
            archived_at: null,
            updated_at: testTs(),
          },
        };

        fx.data[1].attributes = {
          name: 'Last in List',
          published_at: testTs(),
          archived_at: null,
          updated_at: testTsSubtract(2),
        };

        fx.data[2].attributes = {
          name: 'Second in List, Not Published',
          published_at: null,
          archived_at: null,
          updated_at: testTsSubtract(1),
        };

        return fx;
      })
      .visit('/programs');

    cy
      .get('.table-list__item')
      .first()
      .should('contain', 'First in List')
      .should('contain', 'On')
      .next()
      .should('contain', 'Second in List, Not Published')
      .should('contain', 'Off');
  });
});
