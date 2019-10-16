import _ from 'underscore';
import moment from 'moment';

context('program all list', function() {
  specify('display programs list', function() {
    cy
      .server()
      .routePrograms(fx => {
        fx.data = _.sample(fx.data, 3);

        fx.data[0] = {
          id: '1',
          attributes: {
            name: 'First in List',
            published: true,
            updated_at: moment().utc().format(),
          },
        };

        fx.data[1].attributes = {
          name: 'Last in List',
          published: true,
          updated_at: moment().utc().subtract(2, 'days').format(),
        };

        fx.data[2].attributes = {
          name: 'Second in List, Not Published',
          published: false,
          updated_at: moment().utc().subtract(1, 'day').format(),
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
