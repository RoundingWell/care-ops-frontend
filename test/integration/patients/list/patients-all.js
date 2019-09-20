import _ from 'underscore';
import 'js/utils/formatting';
import { getIncluded } from 'helpers/json-api';

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

context('patient all list', function() {
  specify('group filtering', function() {
    cy
      .server()
      .routeGroups(_.indentity, testGroups)
      .routePatient()
      .routePatientActions()
      .routePatients(fx => {
        fx.data[0].id = '1';

        fx.data[0].attributes = {
          first_name: 'Aaron',
          last_name: 'Aaronson',
        };

        fx.data[0].relationships.groups.data = _.collectionOf(['1', '2'], 'id');

        fx.included = getIncluded(fx.included, _.first(testGroups, 2), 'groups');

        return fx;
      })
      .visit('/patients/all')
      .wait('@routePatients')
      .its('url')
      .should('contain', 'filter[group]=1');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .should('contain', 'Aaron Aaronson')
      .should('contain', 'Another Group, Group One')
      .click();

    cy
      .url()
      .should('contain', 'patient/dashboard/1')
      .go('back')
      .wait('@routePatients');

    cy
      .get('.list-page__filters')
      .contains('Group One')
      .click();

    cy
      .get('.picklist__item')
      .first()
      .next()
      .should('contain', 'Another Group')
      .click()
      .wait('@routePatients')
      .its('url')
      .should('contain', 'filter[group]=2');

    cy
      .get('.list-page__filters')
      .contains('Another Group');
  });

  specify('name sorting', function() {
    cy
      .server()
      .routeGroups(_.indentity, testGroups)
      .routePatient()
      .routePatientActions()
      .routePatients(fx => {
        fx.data = _.sample(fx.data, 3);

        fx.data[0].attributes = {
          first_name: 'Baaron',
          last_name: 'Baronson',
        };

        fx.data[1].attributes = {
          first_name: 'Baaron',
          last_name: 'Aaronson',
        };

        fx.data[2].attributes = {
          first_name: 'Aaron',
          last_name: 'Aaronson',
        };

        return fx;
      })
      .visit('/patients/all')
      .wait('@routePatients');

    cy
      .get('.app-frame__content')
      .find('.table-list__item')
      .first()
      .should('contain', 'Aaron Aaronson')
      .next()
      .should('contain', 'Baaron Aaronson')
      .next()
      .should('contain', 'Baaron Baronson');
  });
});
