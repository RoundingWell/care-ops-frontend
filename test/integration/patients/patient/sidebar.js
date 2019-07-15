import _ from 'underscore';
import 'js/utils/formatting';
import moment from 'moment';
import formatDate from 'helpers/format-date';
import { getIncluded } from 'helpers/json-api';

context('patient sidebar', function() {
  specify('display patient data', function() {
    const dob = moment().subtract(10, 'years');

    cy
      .server()
      .routePatientActions()
      .routePatient(fx => {
        fx.data.attributes = {
          first_name: 'First',
          last_name: 'Last',
          birth_date: dob.format('YYYY-MM-DD'),
          mrn: 'a12345',
          sex: 'f',
        };

        return fx;
      })
      .visit('/patient/dashboard/1')
      .wait('@routePatient');

    cy
      .get('.patient-sidebar')
      .should('contain', 'First Last')
      .should('contain', formatDate(dob, 'LONG'))
      .should('contain', `Age ${ moment().diff(dob, 'years') }`);

    cy
      .get('.patient-sidebar')
      .contains('MRN')
      .next()
      .contains('a12345');

    cy
      .get('.patient-sidebar')
      .contains('Sex')
      .next()
      .contains('Female');
  });

  specify('patient fields', function() {
    cy
      .server()
      .routePatientActions()
      .routePatient(fx => {
        fx.data.relationships['patient-fields'].data = _.collectionOf(['1', '2', '3'], 'id');

        fx.included = getIncluded(fx.included, [
          {
            id: '1',
            name: 'String',
            value: 'value',
          },
          {
            id: '2',
            name: 'Number',
            value: 12345,
          },
          {
            id: '3',
            name: 'Empty',
            value: null,
          },
        ], 'patient-fields');

        return fx;
      })
      .visit('/patient/dashboard/1')
      .wait('@routePatient');

    cy
      .get('.patient-sidebar')
      .contains('String')
      .next()
      .contains('value');

    cy
      .get('.patient-sidebar')
      .contains('Number')
      .next()
      .contains('12345');

    cy
      .get('.patient-sidebar')
      .contains('Empty')
      .next()
      .should('be.empty');
  });

  specify('patient groups', function() {
    cy
      .server()
      .routePatientActions()
      .routePatient(fx => {
        fx.data.relationships.groups.data = _.collectionOf(['1', '2'], 'id');

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
      .visit('/patient/dashboard/1')
      .wait('@routePatient');

    cy
      .get('.patient-sidebar')
      .contains('Groups')
      .next()
      .contains('Group One')
      .next()
      .should('contain', 'Another Group');
  });
});
