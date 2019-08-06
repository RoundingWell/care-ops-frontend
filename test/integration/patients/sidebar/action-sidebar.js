import moment from 'moment';

import { getResource } from 'helpers/json-api';
import formatDate from 'helpers/format-date';

context('action sidebar', function() {
  specify('display action sidebar', function() {
    const now = moment.utc();
    const local = moment();

    cy
      .server()
      .routePatientActions(fx => {
        fx.data[0].id = '1';
        fx.data[0].attributes.updated_at = now.format();
        fx.data[0].relationships.events.data[0].id = '11111';

        return fx;
      }, '1')
      .routeActionActivity(fx => {
        fx.data = getResource(this.fxEvents, 'events');
        fx.data[0].attributes.date = now.format();

        return fx;
      })
      .routePatient()
      .visit('/patient/1/action/1')
      .wait('@routePatientActions')
      .wait('@routeActionActivity')
      .wait('@routePatient');

    cy
      .get('.action-sidebar__timestamps')
      .contains('Created')
      .next()
      .should('contain', formatDate(local, 'AT_TIME'));

    cy
      .get('.action-sidebar__timestamps')
      .contains('Last Updated')
      .next()
      .should('contain', formatDate(local, 'AT_TIME'));

    cy
      .get('[data-activity-region]')
      .should('contain', 'Kasey Swaniawski (Nurse) added this Action')
      .should('contain', 'Jarvis Lueilwitz (Other) changed the Owner to Connor Prosacco')
      .should('contain', 'Agnes Brakus (Other) changed the details of this Action')
      .should('contain', 'Cleo Harris (Other) changed the Due Date to ')
      .should('contain', 'Adonis Wisozk (Nurse) changed Duration to 14')
      .should('contain', 'Darrell Breitenberg (Specialist) changed the name of this Action from evolve matrix to transform migration')
      .should('contain', 'Maverick Goldner (Coordinator) changed the Owner to Physician')
      .should('contain', 'Eleazar Grimes (Pharmacist) changed State to Done');
  });
});
