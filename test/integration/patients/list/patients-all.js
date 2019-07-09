import _ from 'underscore';
import 'js/utils/formatting';
import { getIncluded } from 'helpers/json-api';

context('patient all list', function() {
  specify('display all patients', function() {
    cy
      .server()
      .routeCurrentClinician(fx => {
        fx.data.relationships.groups.data = _.collectionOf(['1', '2', '3'], 'id');

        fx.included = getIncluded(fx.included, [
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
        ], 'groups');
        return fx;
      })
      .routePatient()
      .routePatientActions()
      .routePatients(fx => {
        fx.data[0].id = '1';

        fx.data[0].attributes = {
          first_name: 'First',
          last_name: 'Last',
        };

        fx.data[0].relationships.groups.data = _.collectionOf(['1', '2'], 'id');

        fx.included = getIncluded(fx.included, [
          {
            id: '1',
            name: 'Group One',
          },
          {
            id: '2',
            name: 'Another Group',
          },
        ], 'groups');

        return fx;
      })
      .visit('/patients/all')
      .wait('@routePatients');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .should('contain', 'First Last')
      .should('contain', 'Group One')
      .click();

    cy
      .url()
      .should('contain', 'patient/dashboard/1')
      .go('back');

    cy
      .get('.button--blue')
      .should('contain', 'All Groups')
      .click();

    cy
      .get('.picklist__item')
      .first()
      .next()
      .should('contain', 'Group One')
      .click();
  });
});
