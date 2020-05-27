import moment from 'moment';

import formatDate from 'helpers/format-date';

context('patient check-in', function() {
  specify('display patient check-in', function() {
    const completedDate = moment().subtract(7, 'days');

    cy
      .server()
      .routePatient(fx => {
        fx.data.attributes.first_name = 'Test';
        fx.data.attributes.last_name = 'Patient';

        return fx;
      })
      .routePatientCheckIn(fx => {
        fx.data.attributes.finished_at = completedDate.format();

        return fx;
      })
      .visit('/patient/1/check-in/1')
      .wait('@routePatient')
      .wait('@routePatientCheckIn');

    cy
      .get('.check-in__frame')
      .find('.check-in__context-trail')
      .should('contain', 'Test Patient')
      .should('contain', formatDate(completedDate, 'LONG'));

    cy
      .get('.check-in__frame')
      .find('.check-in__content .check-in__item')
      .first()
      .should('have.class', 'check-in__message-item')
      .next()
      .find('.check-in__patient-answer');

    cy
      .get('.check-in__frame')
      .find('.check-in__context-trail .js-back')
      .click();
  });

  specify('patient check-in does not exist', function() {
    cy
      .server()
      .visit('/patient/1/check-in/1');

    cy
      .get('.alert-box')
      .contains('The Check-In you requested does not exist');
  });
});
